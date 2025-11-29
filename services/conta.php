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
require_once __DIR__ . '/config.php';

// Verificar se é uma requisição POST ou PUT
if (!in_array($_SERVER['REQUEST_METHOD'], ['POST', 'PUT'])) {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Método não permitido']);
    exit;
}

// Verificar se o usuário está logado
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}
if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Usuário não autenticado']);
    exit;
}

try {
    // Conectar ao banco de dados usando função centralizada
    $pdo = getDatabaseConnection($database_config);

    // Verificar se é upload de foto
    if (isset($_FILES['profile_photo']) && $_FILES['profile_photo']['error'] === UPLOAD_ERR_OK) {
        $result = handleProfilePhotoUpload($_FILES['profile_photo'], $_SESSION['user_id'], $pdo);
        echo json_encode($result);
        exit;
    }

    // Verificar se é alteração de senha
    if (isset($_POST['action']) && $_POST['action'] === 'change_password') {
        $result = handlePasswordChange($_POST, $_SESSION['user_id'], $pdo);
        echo json_encode($result);
        exit;
    }

    // Verificar se é requisição GET para obter dados do usuário
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        $result = getUserData($_SESSION['user_id'], $pdo);
        echo json_encode($result);
        exit;
    }

    // Obter dados do formulário
    $user_id = $_SESSION['user_id'];
    $name = trim($_POST['name'] ?? '');
    $email = trim($_POST['email'] ?? '');
    $phone = trim($_POST['phone'] ?? '');
    $whatsapp = trim($_POST['whatsapp'] ?? '');
    $instagram = trim($_POST['instagram'] ?? '');
    $communication_email = trim($_POST['communication_email'] ?? '');
    $bio = trim($_POST['bio'] ?? '');
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

    // Validar bio (máximo 500 caracteres)
    if (!empty($bio) && mb_strlen($bio) > 500) {
        $errors[] = 'A descrição não pode ter mais de 500 caracteres';
    }

    // Validar email de comunicação se fornecido
    if (!empty($communication_email) && !filter_var($communication_email, FILTER_VALIDATE_EMAIL)) {
        $errors[] = 'Email de comunicação inválido';
    }

    // Validar WhatsApp se fornecido
    if (!empty($whatsapp) && !preg_match('/^\(\d{2}\)\s\d{4,5}-\d{4}$/', $whatsapp)) {
        $errors[] = 'Formato de WhatsApp inválido';
    }

    // Validar senhas se fornecidas
    // Apenas validar se realmente há uma nova senha sendo definida
    if (!empty($new_password) && trim($new_password) !== '') {
        if (empty($current_password) || trim($current_password) === '' || $current_password === '••••••••') {
            $errors[] = 'Senha atual é obrigatória para alterar a senha';
        }

        if (strlen($new_password) < 8) {
            $errors[] = 'Nova senha deve ter pelo menos 8 caracteres';
        }

        if (!preg_match('/(?=.*[a-zA-Z])(?=.*\d)/', $new_password)) {
            $errors[] = 'Nova senha deve conter pelo menos uma letra e um número';
        }

        if (empty($confirm_password) || $new_password !== $confirm_password) {
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

        // Campos de redes sociais e comunicação
        $redes_sociais = [];
        
        // Buscar redes sociais existentes
        $stmt = $pdo->prepare("SELECT redes_sociais FROM usuarios WHERE id = ?");
        $stmt->execute([$user_id]);
        $existing = $stmt->fetch();
        if ($existing && $existing['redes_sociais']) {
            $redes_sociais = json_decode($existing['redes_sociais'], true) ?? [];
        }
        
        // Atualizar redes sociais
        if (!empty($whatsapp)) {
            $redes_sociais['whatsapp'] = $whatsapp;
        }
        if (!empty($instagram)) {
            $redes_sociais['instagram'] = $instagram;
        }
        if (!empty($communication_email)) {
            $redes_sociais['communication_email'] = $communication_email;
        }
        
        // Salvar redes sociais como JSON
        $update_fields[] = "redes_sociais = ?";
        $update_values[] = json_encode($redes_sociais);
        
        // Atualizar bio
        if (isset($_POST['bio'])) {
            // Limitar bio a 500 caracteres
            $bio = mb_substr($bio, 0, 500);
            $update_fields[] = "bio = ?";
            $update_values[] = $bio;
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
                'whatsapp' => $whatsapp,
                'instagram' => $instagram,
                'communication_email' => $communication_email,
                'bio' => $bio,
                'address' => $address,
                'city' => $city,
                'state' => $state,
                'zipcode' => $zipcode,
                'redes_sociais' => $redes_sociais
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

/**
 * Obter dados do usuário
 */
function getUserData($user_id, $pdo) {
    try {
        $stmt = $pdo->prepare("
            SELECT id, nome, email, telefone, slug, bio, especialidades, redes_sociais, 
                   foto_perfil, endereco, cidade, estado, cep, created_at, is_active
            FROM usuarios 
            WHERE id = ?
        ");
        $stmt->execute([$user_id]);
        $user = $stmt->fetch();
        
        if (!$user) {
            return ['success' => false, 'message' => 'Usuário não encontrado'];
        }
        
        // Decodificar JSON fields
        $user['especialidades'] = json_decode($user['especialidades'] ?? '[]', true);
        $redes_sociais = json_decode($user['redes_sociais'] ?? '{}', true);
        $user['redes_sociais'] = $redes_sociais;
        
        // Extrair campos individuais das redes sociais
        $user['whatsapp'] = $redes_sociais['whatsapp'] ?? '';
        $user['instagram'] = $redes_sociais['instagram'] ?? '';
        $user['communication_email'] = $redes_sociais['communication_email'] ?? '';
        
        // Mapear campos para formato esperado pelo frontend
        $user['name'] = $user['nome'];
        $user['phone'] = $user['telefone'];
        $user['address'] = $user['endereco'] ?? '';
        $user['city'] = $user['cidade'] ?? '';
        $user['state'] = $user['estado'] ?? '';
        $user['zipcode'] = $user['cep'] ?? '';
        $user['profile_photo'] = $user['foto_perfil'] ?? '';
        
        // Obter estatísticas
        $stats = getUserStats($user_id, $pdo);
        
        return [
            'success' => true,
            'data' => $user,
            'stats' => $stats
        ];
    } catch (Exception $e) {
        error_log('Erro ao obter dados do usuário: ' . $e->getMessage());
        return ['success' => false, 'message' => 'Erro ao carregar dados do usuário'];
    }
}

/**
 * Obter estatísticas do usuário
 */
function getUserStats($user_id, $pdo) {
    try {
        // Para decoradores - contar orçamentos
        $stmt = $pdo->prepare("
            SELECT COUNT(*) as total_orcamentos
            FROM orcamentos 
            WHERE decorador_id = ?
        ");
        $stmt->execute([$user_id]);
        $budget_stats = $stmt->fetch();
        
        return [
            'total_orcamentos' => $budget_stats['total_orcamentos'] ?? 0,
            'member_since' => date('M Y', strtotime($user['created_at'] ?? 'now'))
        ];
    } catch (Exception $e) {
        error_log('Erro ao obter estatísticas: ' . $e->getMessage());
        return [
            'total_orcamentos' => 0,
            'member_since' => '-'
        ];
    }
}

/**
 * Upload de foto de perfil
 */
function handleProfilePhotoUpload($file, $user_id, $pdo) {
    try {
        // Validar arquivo
        $allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        if (!in_array($file['type'], $allowedTypes)) {
            return ['success' => false, 'message' => 'Tipo de arquivo não permitido. Use apenas JPG, PNG, GIF ou WebP'];
        }
        
        $maxSize = 5 * 1024 * 1024; // 5MB
        if ($file['size'] > $maxSize) {
            return ['success' => false, 'message' => 'Arquivo muito grande. Tamanho máximo: 5MB'];
        }
        
        // Criar diretório se não existir
        $uploadDir = '../uploads/profile_photos/';
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0755, true);
        }
        
        // Gerar nome único
        $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
        $fileName = 'profile_' . $user_id . '_' . uniqid() . '.' . $extension;
        $filePath = $uploadDir . $fileName;
        
        // Mover arquivo
        if (move_uploaded_file($file['tmp_name'], $filePath)) {
            // Atualizar banco de dados
            $stmt = $pdo->prepare("
                UPDATE usuarios 
                SET foto_perfil = ? 
                WHERE id = ?
            ");
            $stmt->execute(['uploads/profile_photos/' . $fileName, $user_id]);
            
            return [
                'success' => true,
                'message' => 'Foto de perfil atualizada com sucesso!',
                'photo_path' => 'uploads/profile_photos/' . $fileName
            ];
        } else {
            return ['success' => false, 'message' => 'Erro ao salvar arquivo'];
        }
    } catch (Exception $e) {
        error_log('Erro no upload de foto: ' . $e->getMessage());
        return ['success' => false, 'message' => 'Erro interno no upload'];
    }
}

/**
 * Alteração de senha
 */
function handlePasswordChange($data, $user_id, $pdo) {
    try {
        $current_password = $data['current_password'] ?? '';
        $new_password = $data['new_password'] ?? '';
        $confirm_password = $data['confirm_password'] ?? '';
        
        // Validar dados
        if (empty($current_password) || empty($new_password) || empty($confirm_password)) {
            return ['success' => false, 'message' => 'Todos os campos são obrigatórios'];
        }
        
        if ($new_password !== $confirm_password) {
            return ['success' => false, 'message' => 'As senhas não coincidem'];
        }
        
        if (strlen($new_password) < 6) {
            return ['success' => false, 'message' => 'A nova senha deve ter pelo menos 6 caracteres'];
        }
        
        // Verificar senha atual
        $stmt = $pdo->prepare("SELECT senha FROM usuarios WHERE id = ?");
        $stmt->execute([$user_id]);
        $user = $stmt->fetch();
        
        if (!$user || !password_verify($current_password, $user['senha'])) {
            return ['success' => false, 'message' => 'Senha atual incorreta'];
        }
        
        // Atualizar senha
        $hashedPassword = password_hash($new_password, PASSWORD_DEFAULT);
        $stmt = $pdo->prepare("
            UPDATE usuarios 
            SET senha = ?, updated_at = NOW() 
            WHERE id = ?
        ");
        $stmt->execute([$hashedPassword, $user_id]);
        
        return [
            'success' => true,
            'message' => 'Senha alterada com sucesso!'
        ];
    } catch (Exception $e) {
        error_log('Erro ao alterar senha: ' . $e->getMessage());
        return ['success' => false, 'message' => 'Erro interno ao alterar senha'];
    }
}
?>