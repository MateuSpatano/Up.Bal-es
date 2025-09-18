<?php
/**
 * Serviço de Login para Up.Baloes
 * 
 * Este arquivo demonstra como integrar o frontend com o backend PHP
 * para autenticação de usuários.
 */

// Configurações de CORS para desenvolvimento
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Permitir requisições OPTIONS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Configurações de sessão
session_start();

// Configurações de banco de dados (exemplo)
$config = [
    'host' => 'localhost',
    'dbname' => 'up_baloes',
    'username' => 'root',
    'password' => '',
    'charset' => 'utf8mb4'
];

/**
 * Classe para gerenciamento de autenticação
 */
class AuthService {
    private $pdo;
    
    public function __construct($config) {
        try {
            $dsn = "mysql:host={$config['host']};dbname={$config['dbname']};charset={$config['charset']}";
            $this->pdo = new PDO($dsn, $config['username'], $config['password'], [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
            ]);
        } catch (PDOException $e) {
            throw new Exception('Erro de conexão com o banco de dados: ' . $e->getMessage());
        }
    }
    
    /**
     * Autenticar usuário
     */
    public function login($email, $password, $remember = false) {
        try {
            // Buscar usuário no banco
            $stmt = $this->pdo->prepare("
                SELECT id, nome, email, senha, ativo, perfil 
                FROM usuarios 
                WHERE email = ? AND ativo = 1
            ");
            $stmt->execute([$email]);
            $user = $stmt->fetch();
            
            if (!$user) {
                return [
                    'success' => false,
                    'message' => 'Email não encontrado ou usuário inativo.'
                ];
            }
            
            // Verificar senha (assumindo que está hasheada)
            if (!password_verify($password, $user['senha'])) {
                return [
                    'success' => false,
                    'message' => 'Senha incorreta.'
                ];
            }
            
            // Gerar token de sessão
            $token = $this->generateToken($user['id']);
            
            // Salvar sessão
            $_SESSION['user_id'] = $user['id'];
            $_SESSION['user_email'] = $user['email'];
            $_SESSION['user_name'] = $user['nome'];
            $_SESSION['user_profile'] = $user['perfil'];
            $_SESSION['token'] = $token;
            
            // Salvar token no banco se "lembrar" estiver marcado
            if ($remember) {
                $this->saveRememberToken($user['id'], $token);
            }
            
            // Log de acesso
            $this->logAccess($user['id'], 'login');
            
            return [
                'success' => true,
                'user' => [
                    'id' => $user['id'],
                    'name' => $user['nome'],
                    'email' => $user['email'],
                    'profile' => $user['perfil']
                ],
                'token' => $token
            ];
            
        } catch (Exception $e) {
            error_log('Erro no login: ' . $e->getMessage());
            return [
                'success' => false,
                'message' => 'Erro interno do servidor.'
            ];
        }
    }
    
    /**
     * Recuperar senha
     */
    public function resetPassword($email) {
        try {
            // Verificar se email existe
            $stmt = $this->pdo->prepare("SELECT id, nome FROM usuarios WHERE email = ? AND ativo = 1");
            $stmt->execute([$email]);
            $user = $stmt->fetch();
            
            if (!$user) {
                return [
                    'success' => false,
                    'message' => 'Email não encontrado.'
                ];
            }
            
            // Gerar token de recuperação
            $resetToken = $this->generateResetToken();
            $expiry = date('Y-m-d H:i:s', strtotime('+1 hour'));
            
            // Salvar token de recuperação
            $stmt = $this->pdo->prepare("
                INSERT INTO password_resets (user_id, token, expires_at) 
                VALUES (?, ?, ?)
                ON DUPLICATE KEY UPDATE 
                token = VALUES(token), 
                expires_at = VALUES(expires_at),
                created_at = NOW()
            ");
            $stmt->execute([$user['id'], $resetToken, $expiry]);
            
            // Enviar email (implementar conforme necessário)
            $this->sendResetEmail($email, $user['nome'], $resetToken);
            
            return [
                'success' => true,
                'message' => 'Email de recuperação enviado com sucesso!'
            ];
            
        } catch (Exception $e) {
            error_log('Erro na recuperação de senha: ' . $e->getMessage());
            return [
                'success' => false,
                'message' => 'Erro interno do servidor.'
            ];
        }
    }
    
    /**
     * Verificar se usuário está autenticado
     */
    public function isAuthenticated() {
        return isset($_SESSION['user_id']) && !empty($_SESSION['user_id']);
    }
    
    /**
     * Fazer logout
     */
    public function logout() {
        if (isset($_SESSION['user_id'])) {
            $this->logAccess($_SESSION['user_id'], 'logout');
        }
        
        session_destroy();
        
        return [
            'success' => true,
            'message' => 'Logout realizado com sucesso.'
        ];
    }
    
    /**
     * Gerar token de sessão
     */
    private function generateToken($userId) {
        return bin2hex(random_bytes(32)) . '_' . $userId;
    }
    
    /**
     * Gerar token de recuperação
     */
    private function generateResetToken() {
        return bin2hex(random_bytes(32));
    }
    
    /**
     * Salvar token para "lembrar"
     */
    private function saveRememberToken($userId, $token) {
        $expiry = date('Y-m-d H:i:s', strtotime('+30 days'));
        
        $stmt = $this->pdo->prepare("
            INSERT INTO remember_tokens (user_id, token, expires_at) 
            VALUES (?, ?, ?)
            ON DUPLICATE KEY UPDATE 
            token = VALUES(token), 
            expires_at = VALUES(expires_at)
        ");
        $stmt->execute([$userId, $token, $expiry]);
    }
    
    /**
     * Log de acesso
     */
    private function logAccess($userId, $action) {
        try {
            $stmt = $this->pdo->prepare("
                INSERT INTO access_logs (user_id, action, ip_address, user_agent, created_at) 
                VALUES (?, ?, ?, ?, NOW())
            ");
            $stmt->execute([
                $userId,
                $action,
                $_SERVER['REMOTE_ADDR'] ?? 'unknown',
                $_SERVER['HTTP_USER_AGENT'] ?? 'unknown'
            ]);
        } catch (Exception $e) {
            error_log('Erro ao salvar log: ' . $e->getMessage());
        }
    }
    
    /**
     * Enviar email de recuperação
     */
    private function sendResetEmail($email, $name, $token) {
        // Implementar envio de email conforme necessário
        // Pode usar PHPMailer, SwiftMailer, ou serviço de email
        
        $resetLink = "http://localhost/Up.BaloesV3/pages/reset-password.html?token=" . $token;
        
        // Por enquanto, apenas log (substituir por envio real)
        error_log("Email de recuperação para {$email}: {$resetLink}");
        
        return true;
    }
}

// Processar requisições
try {
    $auth = new AuthService($config);
    
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!$input) {
            throw new Exception('Dados inválidos.');
        }
        
        $action = $input['action'] ?? '';
        
        switch ($action) {
            case 'login':
                $email = $input['email'] ?? '';
                $password = $input['password'] ?? '';
                $remember = $input['remember'] ?? false;
                
                if (empty($email) || empty($password)) {
                    throw new Exception('Email e senha são obrigatórios.');
                }
                
                $result = $auth->login($email, $password, $remember);
                break;
                
            case 'reset_password':
                $email = $input['email'] ?? '';
                
                if (empty($email)) {
                    throw new Exception('Email é obrigatório.');
                }
                
                $result = $auth->resetPassword($email);
                break;
                
            case 'logout':
                $result = $auth->logout();
                break;
                
            case 'check_auth':
                $result = [
                    'success' => $auth->isAuthenticated(),
                    'user' => $auth->isAuthenticated() ? [
                        'id' => $_SESSION['user_id'],
                        'name' => $_SESSION['user_name'],
                        'email' => $_SESSION['user_email'],
                        'profile' => $_SESSION['user_profile']
                    ] : null
                ];
                break;
                
            default:
                throw new Exception('Ação não reconhecida.');
        }
        
        echo json_encode($result);
        
    } else {
        throw new Exception('Método não permitido.');
    }
    
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}

/**
 * ESTRUTURA DO BANCO DE DADOS (SQL para criação das tabelas)
 * 
 * CREATE DATABASE up_baloes;
 * USE up_baloes;
 * 
 * CREATE TABLE usuarios (
 *     id INT AUTO_INCREMENT PRIMARY KEY,
 *     nome VARCHAR(100) NOT NULL,
 *     email VARCHAR(100) UNIQUE NOT NULL,
 *     senha VARCHAR(255) NOT NULL,
 *     perfil ENUM('admin', 'user', 'manager') DEFAULT 'user',
 *     ativo BOOLEAN DEFAULT TRUE,
 *     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 *     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
 * );
 * 
 * CREATE TABLE remember_tokens (
 *     user_id INT PRIMARY KEY,
 *     token VARCHAR(255) NOT NULL,
 *     expires_at TIMESTAMP NOT NULL,
 *     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 *     FOREIGN KEY (user_id) REFERENCES usuarios(id) ON DELETE CASCADE
 * );
 * 
 * CREATE TABLE password_resets (
 *     id INT AUTO_INCREMENT PRIMARY KEY,
 *     user_id INT NOT NULL,
 *     token VARCHAR(255) NOT NULL,
 *     expires_at TIMESTAMP NOT NULL,
 *     used BOOLEAN DEFAULT FALSE,
 *     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 *     FOREIGN KEY (user_id) REFERENCES usuarios(id) ON DELETE CASCADE
 * );
 * 
 * CREATE TABLE access_logs (
 *     id INT AUTO_INCREMENT PRIMARY KEY,
 *     user_id INT,
 *     action VARCHAR(50) NOT NULL,
 *     ip_address VARCHAR(45),
 *     user_agent TEXT,
 *     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 *     FOREIGN KEY (user_id) REFERENCES usuarios(id) ON DELETE SET NULL
 * );
 * 
 * -- Inserir usuário admin padrão
 * INSERT INTO usuarios (nome, email, senha, perfil) 
 * VALUES ('Administrador', 'admin@upbaloes.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin');
 * -- Senha padrão: password
 */
?>