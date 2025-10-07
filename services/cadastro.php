<?php
// Serviço de cadastro Up.Baloes
require_once 'config.php';

// Headers CORS
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Classe de gerenciamento de cadastro
class CadastroService {
    private $pdo;
    
    public function __construct($config) {
        try {
            $this->pdo = getDatabaseConnection($config);
        } catch (Exception $e) {
            throw new Exception('Erro de conexão com o banco de dados: ' . $e->getMessage());
        }
    }
    
    /**
     * Cadastrar novo usuário
     */
    public function cadastrarUsuario($dados) {
        try {
            // Validar dados obrigatórios
            $this->validarDados($dados);
            
            // Verificar se email já existe
            if ($this->emailExiste($dados['email'])) {
                return [
                    'success' => false,
                    'message' => 'Este email já está cadastrado no sistema.'
                ];
            }
            
            // Gerar slug único para o usuário
            $slug = $this->gerarSlug($dados['nome']);
            
            // Hash da senha
            $senhaHash = hashPassword($dados['senha']);
            
            // Preparar dados para inserção
            $dadosUsuario = [
                'nome' => sanitizeInput($dados['nome']),
                'email' => sanitizeInput($dados['email']),
                'senha' => $senhaHash,
                'telefone' => !empty($dados['telefone']) ? sanitizeInput($dados['telefone']) : null,
                'endereco' => !empty($dados['endereco']) ? sanitizeInput($dados['endereco']) : null,
                'cidade' => !empty($dados['cidade']) ? sanitizeInput($dados['cidade']) : null,
                'estado' => !empty($dados['estado']) ? sanitizeInput($dados['estado']) : null,
                'cep' => !empty($dados['cep']) ? sanitizeInput($dados['cep']) : null,
                'slug' => $slug,
                'perfil' => 'user', // Cliente comum
                'ativo' => 1,
                'aprovado_por_admin' => 1, // Clientes são aprovados automaticamente
                'created_at' => date('Y-m-d H:i:s')
            ];
            
            // Inserir usuário no banco
            $stmt = $this->pdo->prepare("
                INSERT INTO usuarios (
                    nome, email, senha, telefone, endereco, cidade, estado, cep, 
                    slug, perfil, ativo, aprovado_por_admin, created_at
                ) VALUES (
                    :nome, :email, :senha, :telefone, :endereco, :cidade, :estado, :cep,
                    :slug, :perfil, :ativo, :aprovado_por_admin, :created_at
                )
            ");
            
            $stmt->execute($dadosUsuario);
            $userId = $this->pdo->lastInsertId();
            
            // Log de cadastro
            $this->logCadastro($userId, $dados['email']);
            
            return [
                'success' => true,
                'message' => 'Conta criada com sucesso!',
                'user_id' => $userId
            ];
            
        } catch (Exception $e) {
            error_log('Erro no cadastro: ' . $e->getMessage());
            return [
                'success' => false,
                'message' => 'Erro interno do servidor. Tente novamente.'
            ];
        }
    }
    
    /**
     * Validar dados de entrada
     */
    private function validarDados($dados) {
        // Nome obrigatório
        if (empty($dados['nome']) || strlen(trim($dados['nome'])) < 2) {
            throw new Exception('Nome deve ter pelo menos 2 caracteres.');
        }
        
        // Email obrigatório e válido
        if (empty($dados['email']) || !validateEmail($dados['email'])) {
            throw new Exception('Email inválido.');
        }
        
        // Senha obrigatória
        if (empty($dados['senha']) || strlen($dados['senha']) < 6) {
            throw new Exception('Senha deve ter pelo menos 6 caracteres.');
        }
        
        // Validar telefone se fornecido
        if (!empty($dados['telefone'])) {
            $telefone = preg_replace('/\D/', '', $dados['telefone']);
            if (strlen($telefone) < 10 || strlen($telefone) > 11) {
                throw new Exception('Telefone deve ter 10 ou 11 dígitos.');
            }
        }
        
        // Validar CEP se fornecido
        if (!empty($dados['cep'])) {
            $cep = preg_replace('/\D/', '', $dados['cep']);
            if (strlen($cep) !== 8) {
                throw new Exception('CEP deve ter 8 dígitos.');
            }
        }
    }
    
    /**
     * Verificar se email já existe
     */
    private function emailExiste($email) {
        $stmt = $this->pdo->prepare("SELECT id FROM usuarios WHERE email = ?");
        $stmt->execute([$email]);
        return $stmt->fetch() !== false;
    }
    
    /**
     * Gerar slug único para o usuário
     */
    private function gerarSlug($nome) {
        // Converter nome para slug
        $slug = strtolower(trim($nome));
        $slug = preg_replace('/[^a-z0-9-]/', '-', $slug);
        $slug = preg_replace('/-+/', '-', $slug);
        $slug = trim($slug, '-');
        
        // Verificar se slug já existe e adicionar número se necessário
        $originalSlug = $slug;
        $counter = 1;
        
        while ($this->slugExiste($slug)) {
            $slug = $originalSlug . '-' . $counter;
            $counter++;
        }
        
        return $slug;
    }
    
    /**
     * Verificar se slug já existe
     */
    private function slugExiste($slug) {
        $stmt = $this->pdo->prepare("SELECT id FROM usuarios WHERE slug = ?");
        $stmt->execute([$slug]);
        return $stmt->fetch() !== false;
    }
    
    /**
     * Log de cadastro
     */
    private function logCadastro($userId, $email) {
        try {
            $stmt = $this->pdo->prepare("
                INSERT INTO access_logs (user_id, action, ip_address, user_agent, created_at) 
                VALUES (?, 'cadastro', ?, ?, NOW())
            ");
            $stmt->execute([
                $userId,
                $_SERVER['REMOTE_ADDR'] ?? 'unknown',
                $_SERVER['HTTP_USER_AGENT'] ?? 'unknown'
            ]);
        } catch (Exception $e) {
            error_log('Erro ao salvar log de cadastro: ' . $e->getMessage());
        }
    }
    
    /**
     * Verificar se usuário pode se cadastrar (limite de tentativas)
     */
    public function podeCadastrar($ip) {
        try {
            // Verificar tentativas de cadastro nas últimas 24 horas
            $stmt = $this->pdo->prepare("
                SELECT COUNT(*) as tentativas 
                FROM access_logs 
                WHERE action = 'cadastro' 
                AND ip_address = ? 
                AND created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
            ");
            $stmt->execute([$ip]);
            $result = $stmt->fetch();
            
            // Limite de 5 tentativas por IP por dia
            return $result['tentativas'] < 5;
            
        } catch (Exception $e) {
            error_log('Erro ao verificar limite de cadastro: ' . $e->getMessage());
            return true; // Em caso de erro, permitir cadastro
        }
    }
}

// Processar requisições
try {
    $cadastro = new CadastroService($database_config);
    
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!$input) {
            throw new Exception('Dados inválidos.');
        }
        
        $action = $input['action'] ?? '';
        
        switch ($action) {
            case 'cadastrar':
                // Verificar limite de tentativas
                $ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
                if (!$cadastro->podeCadastrar($ip)) {
                    errorResponse('Muitas tentativas de cadastro. Tente novamente em 24 horas.', 429);
                }
                
                $result = $cadastro->cadastrarUsuario($input);
                break;
                
            case 'verificar_email':
                $email = $input['email'] ?? '';
                if (empty($email)) {
                    throw new Exception('Email é obrigatório.');
                }
                
                $stmt = $this->pdo->prepare("SELECT id FROM usuarios WHERE email = ?");
                $stmt->execute([$email]);
                $existe = $stmt->fetch() !== false;
                
                $result = [
                    'success' => true,
                    'disponivel' => !$existe,
                    'message' => $existe ? 'Email já cadastrado' : 'Email disponível'
                ];
                break;
                
            default:
                throw new Exception('Ação não reconhecida.');
        }
        
        if ($result['success']) {
            successResponse($result, $result['message']);
        } else {
            errorResponse($result['message'], 400);
        }
        
    } else {
        throw new Exception('Método não permitido.');
    }
    
} catch (Exception $e) {
    errorResponse($e->getMessage(), 400);
}

/**
 * ESTRUTURA DO BANCO DE DADOS NECESSÁRIA
 * 
 * Certifique-se de que a tabela usuarios tenha os seguintes campos:
 * 
 * ALTER TABLE usuarios 
 * ADD COLUMN IF NOT EXISTS telefone VARCHAR(20) NULL AFTER email,
 * ADD COLUMN IF NOT EXISTS endereco TEXT NULL AFTER telefone,
 * ADD COLUMN IF NOT EXISTS cidade VARCHAR(100) NULL AFTER endereco,
 * ADD COLUMN IF NOT EXISTS estado VARCHAR(2) NULL AFTER cidade,
 * ADD COLUMN IF NOT EXISTS cep VARCHAR(10) NULL AFTER estado,
 * ADD COLUMN IF NOT EXISTS slug VARCHAR(100) UNIQUE NULL AFTER cep;
 * 
 * CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);
 * CREATE INDEX IF NOT EXISTS idx_usuarios_slug ON usuarios(slug);
 * CREATE INDEX IF NOT EXISTS idx_usuarios_telefone ON usuarios(telefone);
 */
?>
