<?php
/**
 * Serviço de Gerenciamento de Decoradores - Up.Baloes
 * 
 * Este arquivo gerencia operações relacionadas aos decoradores,
 * incluindo busca por slug e criação de contas.
 */

// Configurações de CORS para desenvolvimento
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Permitir requisições OPTIONS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Incluir configurações
require_once 'config.php';
require_once '../utils/gerador-slug.php';

/**
 * Classe para gerenciamento de decoradores
 */
class DecoratorService {
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
     * Buscar decorador por slug
     */
    public function getDecoratorBySlug($slug) {
        try {
            $stmt = $this->pdo->prepare("
                SELECT 
                    id, nome, email, telefone, endereco, cidade, estado, cep, 
                    slug, created_at, updated_at
                FROM usuarios 
                WHERE slug = ? AND tipo = 'decorator' AND status = 'active'
            ");
            $stmt->execute([$slug]);
            $decorator = $stmt->fetch();
            
            if (!$decorator) {
                return [
                    'success' => false,
                    'message' => 'Decorador não encontrado'
                ];
            }
            
            // Buscar serviços do decorador
            $services = $this->getDecoratorServices($decorator['id']);
            
            // Buscar portfólio do decorador
            $portfolio = $this->getDecoratorPortfolio($decorator['id']);
            
            return [
                'success' => true,
                'data' => [
                    'decorator' => $decorator,
                    'services' => $services,
                    'portfolio' => $portfolio
                ]
            ];
            
        } catch (Exception $e) {
            error_log('Erro ao buscar decorador por slug: ' . $e->getMessage());
            return [
                'success' => false,
                'message' => 'Erro interno do servidor'
            ];
        }
    }
    
    /**
     * Buscar serviços do decorador
     */
    private function getDecoratorServices($decoratorId) {
        try {
            $stmt = $this->pdo->prepare("
                SELECT 
                    id, nome, descricao, preco_base, categoria, 
                    imagem_url, ativo, created_at
                FROM servicos 
                WHERE decorador_id = ? AND ativo = 1
                ORDER BY nome ASC
            ");
            $stmt->execute([$decoratorId]);
            return $stmt->fetchAll();
            
        } catch (Exception $e) {
            error_log('Erro ao buscar serviços do decorador: ' . $e->getMessage());
            return [];
        }
    }
    
    /**
     * Buscar portfólio do decorador
     */
    private function getDecoratorPortfolio($decoratorId) {
        try {
            $stmt = $this->pdo->prepare("
                SELECT 
                    id, titulo, descricao, imagem_url, 
                    data_evento, tipo_evento, created_at
                FROM portfolio 
                WHERE decorador_id = ? AND ativo = 1
                ORDER BY data_evento DESC
                LIMIT 12
            ");
            $stmt->execute([$decoratorId]);
            return $stmt->fetchAll();
            
        } catch (Exception $e) {
            error_log('Erro ao buscar portfólio do decorador: ' . $e->getMessage());
            return [];
        }
    }
    
    /**
     * Criar novo decorador
     */
    public function createDecorator($data) {
        try {
            // Validar dados obrigatórios
            $requiredFields = ['nome', 'email', 'telefone', 'whatsapp', 'communication_email', 'endereco', 'senha'];
            foreach ($requiredFields as $field) {
                if (empty($data[$field])) {
                    return [
                        'success' => false,
                        'message' => "Campo {$field} é obrigatório"
                    ];
                }
            }
            
            // Validar email
            if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
                return [
                    'success' => false,
                    'message' => 'Email inválido'
                ];
            }
            
            // Validar email de comunicação
            if (!filter_var($data['communication_email'], FILTER_VALIDATE_EMAIL)) {
                return [
                    'success' => false,
                    'message' => 'E-mail para comunicação inválido'
                ];
            }
            
            // Verificar se email já existe
            $stmt = $this->pdo->prepare("SELECT id FROM usuarios WHERE email = ?");
            $stmt->execute([$data['email']]);
            if ($stmt->fetch()) {
                return [
                    'success' => false,
                    'message' => 'Email já cadastrado'
                ];
            }
            
            // Verificar se email de comunicação já existe
            $stmt = $this->pdo->prepare("SELECT id FROM usuarios WHERE communication_email = ?");
            $stmt->execute([$data['communication_email']]);
            if ($stmt->fetch()) {
                return [
                    'success' => false,
                    'message' => 'E-mail para comunicação já cadastrado'
                ];
            }
            
            // Gerar slug único
            $slug = generateUniqueSlug($this->pdo, $data['nome']);
            
            // Hash da senha
            $hashedPassword = password_hash($data['senha'], PASSWORD_DEFAULT);
            
            // Inserir decorador
            $stmt = $this->pdo->prepare("
                INSERT INTO usuarios (
                    nome, email, telefone, whatsapp, communication_email, endereco, cidade, estado, cep,
                    senha, tipo, status, slug, created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'decorator', 'active', ?, NOW(), NOW())
            ");
            
            $stmt->execute([
                $data['nome'],
                $data['email'],
                $data['telefone'],
                $data['whatsapp'],
                $data['communication_email'],
                $data['endereco'],
                $data['cidade'] ?? null,
                $data['estado'] ?? null,
                $data['cep'] ?? null,
                $hashedPassword,
                $slug
            ]);
            
            $decoratorId = $this->pdo->lastInsertId();
            
            return [
                'success' => true,
                'message' => 'Decorador criado com sucesso',
                'data' => [
                    'id' => $decoratorId,
                    'slug' => $slug,
                    'url' => "www.upbaloes.com/{$slug}"
                ]
            ];
            
        } catch (Exception $e) {
            error_log('Erro ao criar decorador: ' . $e->getMessage());
            return [
                'success' => false,
                'message' => 'Erro interno do servidor'
            ];
        }
    }
    
    /**
     * Atualizar slug do decorador
     */
    public function updateDecoratorSlug($decoratorId, $newName) {
        try {
            $slug = generateUniqueSlug($this->pdo, $newName, 'usuarios', 'slug', $decoratorId);
            
            $stmt = $this->pdo->prepare("
                UPDATE usuarios 
                SET slug = ?, updated_at = NOW() 
                WHERE id = ? AND tipo = 'decorator'
            ");
            $stmt->execute([$slug, $decoratorId]);
            
            return [
                'success' => true,
                'data' => [
                    'slug' => $slug,
                    'url' => "www.upbaloes.com/{$slug}"
                ]
            ];
            
        } catch (Exception $e) {
            error_log('Erro ao atualizar slug do decorador: ' . $e->getMessage());
            return [
                'success' => false,
                'message' => 'Erro interno do servidor'
            ];
        }
    }
    
    /**
     * Listar todos os decoradores ativos
     */
    public function listActiveDecorators() {
        try {
            $stmt = $this->pdo->prepare("
                SELECT 
                    id, nome, email, telefone, cidade, estado, 
                    slug, created_at
                FROM usuarios 
                WHERE tipo = 'decorator' AND status = 'active'
                ORDER BY nome ASC
            ");
            $stmt->execute();
            $decorators = $stmt->fetchAll();
            
            // Adicionar URL para cada decorador
            foreach ($decorators as &$decorator) {
                $decorator['url'] = "www.upbaloes.com/{$decorator['slug']}";
            }
            
            return [
                'success' => true,
                'data' => $decorators
            ];
            
        } catch (Exception $e) {
            error_log('Erro ao listar decoradores: ' . $e->getMessage());
            return [
                'success' => false,
                'message' => 'Erro interno do servidor'
            ];
        }
    }
}

// Processar requisições
try {
    $decoratorService = new DecoratorService($database_config);
    
    $method = $_SERVER['REQUEST_METHOD'];
    $input = json_decode(file_get_contents('php://input'), true);
    
    switch ($method) {
        case 'GET':
            // Buscar decorador por slug
            $slug = $_GET['slug'] ?? '';
            if ($slug) {
                $result = $decoratorService->getDecoratorBySlug($slug);
            } else {
                // Listar todos os decoradores
                $result = $decoratorService->listActiveDecorators();
            }
            break;
            
        case 'POST':
            $action = $input['action'] ?? '';
            
            switch ($action) {
                case 'create':
                    $result = $decoratorService->createDecorator($input);
                    break;
                    
                case 'update_slug':
                    $decoratorId = $input['decorator_id'] ?? null;
                    $newName = $input['new_name'] ?? '';
                    
                    if (!$decoratorId || !$newName) {
                        throw new Exception('ID do decorador e novo nome são obrigatórios');
                    }
                    
                    $result = $decoratorService->updateDecoratorSlug($decoratorId, $newName);
                    break;
                    
                default:
                    throw new Exception('Ação não reconhecida');
            }
            break;
            
        default:
            throw new Exception('Método não permitido');
    }
    
    echo json_encode($result);
    
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>
