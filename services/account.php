<?php
/**
 * Serviço de Gerenciamento de Conta - Up.Baloes
 * Endpoint para atualizar informações do usuário
 */

// Configurações de segurança
header('Content-Type: application/json');
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');
header('X-XSS-Protection: 1; mode=block');

// Incluir configurações
require_once 'config.php';

// Verificar se é uma requisição POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Método não permitido']);
    exit;
}

// Verificar se o usuário está logado
session_start();
if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Usuário não autenticado']);
    exit;
}

try {
    // Conectar ao banco de dados
    $pdo = new PDO(
        "mysql:host={$database_config['host']};dbname={$database_config['dbname']};charset=utf8mb4",
        $database_config['username'],
        $database_config['password'],
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false
        ]
    );

    // Obter dados do formulário
    $user_id = $_SESSION['user_id'];
    $name = trim($_POST['name'] ?? '');
    $email = trim($_POST['email'] ?? '');
    $phone = trim($_POST['phone'] ?? '');
    $address = trim($_POST['address'] ?? '');
    $city = trim($_POST['city'] ?? '');
    $state = trim($_POST['state'] ?? '');
    $zipcode = trim($_POST['zipcode'] ?? '');
    $current_password = $_POST['current_password'] ?? '';
    $new_password = $_POST['new_password'] ?? '';
    $confirm_password = $_POST['confirm_password'] ?? '';

    // Validações básicas
    $errors = [];

    // Validar campos obrigatórios
    if (empty($name)) {
        $errors[] = 'Nome é obrigatório';
    }

    if (empty($email)) {
        $errors[] = 'Email é obrigatório';
    } elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $errors[] = 'Email inválido';
    }

    // Validar telefone se fornecido
    if (!empty($phone) && !preg_match('/^\(\d{2}\)\s\d{4,5}-\d{4}$/', $phone)) {
        $errors[] = 'Formato de telefone inválido';
    }

    // Validar CEP se fornecido
    if (!empty($zipcode) && !preg_match('/^\d{5}-?\d{3}$/', $zipcode)) {
        $errors[] = 'Formato de CEP inválido';
    }

    // Validar senhas se fornecidas
    if (!empty($new_password) || !empty($confirm_password)) {
        if (empty($current_password)) {
            $errors[] = 'Senha atual é obrigatória para alterar a senha';
        }

        if (strlen($new_password) < 8) {
            $errors[] = 'Nova senha deve ter pelo menos 8 caracteres';
        }

        if (!preg_match('/(?=.*[a-zA-Z])(?=.*\d)/', $new_password)) {
            $errors[] = 'Nova senha deve conter pelo menos uma letra e um número';
        }

        if ($new_password !== $confirm_password) {
            $errors[] = 'Confirmação de senha não confere';
        }
    }

    // Se há erros, retornar
    if (!empty($errors)) {
        echo json_encode(['success' => false, 'message' => 'Dados inválidos', 'errors' => $errors]);
        exit;
    }

    // Verificar se o email já existe para outro usuário
    $stmt = $pdo->prepare("SELECT id FROM usuarios WHERE email = ? AND id != ?");
    $stmt->execute([$email, $user_id]);
    if ($stmt->fetch()) {
        echo json_encode(['success' => false, 'message' => 'Email já está em uso por outro usuário']);
        exit;
    }

    // Verificar senha atual se fornecida
    if (!empty($current_password)) {
        $stmt = $pdo->prepare("SELECT senha FROM usuarios WHERE id = ?");
        $stmt->execute([$user_id]);
        $user = $stmt->fetch();
        
        if (!$user || !password_verify($current_password, $user['senha'])) {
            echo json_encode(['success' => false, 'message' => 'Senha atual incorreta']);
            exit;
        }
    }

    // Iniciar transação
    $pdo->beginTransaction();

    try {
        // Preparar dados para atualização
        $update_fields = [];
        $update_values = [];

        // Campos básicos
        $update_fields[] = "nome = ?";
        $update_values[] = $name;

        $update_fields[] = "email = ?";
        $update_values[] = $email;

        // Campos opcionais
        if (!empty($phone)) {
            $update_fields[] = "telefone = ?";
            $update_values[] = $phone;
        }

        if (!empty($address)) {
            $update_fields[] = "endereco = ?";
            $update_values[] = $address;
        }

        if (!empty($city)) {
            $update_fields[] = "cidade = ?";
            $update_values[] = $city;
        }

        if (!empty($state)) {
            $update_fields[] = "estado = ?";
            $update_values[] = $state;
        }

        if (!empty($zipcode)) {
            $update_fields[] = "cep = ?";
            $update_values[] = $zipcode;
        }

        // Atualizar senha se fornecida
        if (!empty($new_password)) {
            $hashed_password = password_hash($new_password, PASSWORD_DEFAULT);
            $update_fields[] = "senha = ?";
            $update_values[] = $hashed_password;
        }

        // Adicionar data de atualização
        $update_fields[] = "updated_at = NOW()";

        // Adicionar ID do usuário para WHERE
        $update_values[] = $user_id;

        // Executar atualização
        $sql = "UPDATE usuarios SET " . implode(', ', $update_fields) . " WHERE id = ?";
        $stmt = $pdo->prepare($sql);
        $stmt->execute($update_values);

        // Log da alteração
        $stmt = $pdo->prepare("INSERT INTO access_logs (user_id, action, ip_address, user_agent) VALUES (?, ?, ?, ?)");
        $stmt->execute([
            $user_id,
            'account_updated',
            $_SERVER['REMOTE_ADDR'] ?? 'unknown',
            $_SERVER['HTTP_USER_AGENT'] ?? 'unknown'
        ]);

        // Confirmar transação
        $pdo->commit();

        // Atualizar dados na sessão
        $_SESSION['user_name'] = $name;
        $_SESSION['user_email'] = $email;

        // Resposta de sucesso
        echo json_encode([
            'success' => true,
            'message' => 'Dados atualizados com sucesso!',
            'data' => [
                'name' => $name,
                'email' => $email,
                'phone' => $phone,
                'address' => $address,
                'city' => $city,
                'state' => $state,
                'zipcode' => $zipcode
            ]
        ]);

    } catch (Exception $e) {
        // Reverter transação em caso de erro
        $pdo->rollBack();
        throw $e;
    }

} catch (PDOException $e) {
    // Log do erro
    error_log("Erro no banco de dados (account.php): " . $e->getMessage());
    
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Erro interno do servidor. Tente novamente mais tarde.'
    ]);
    
} catch (Exception $e) {
    // Log do erro
    error_log("Erro geral (account.php): " . $e->getMessage());
    
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Erro interno do servidor. Tente novamente mais tarde.'
    ]);
}
?>