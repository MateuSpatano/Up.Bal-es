<?php
// Serviço de gerenciamento de decoradores Up.Baloes
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/../utils/gerador-slug.php';

// Classe de gerenciamento de decoradores
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
                    id, nome, email, telefone, 
                    slug, created_at, updated_at
                FROM usuarios 
                WHERE slug = ? AND is_active = 1
            ");
            // Nota: campos cidade e estado não estão na tabela usuarios no schema atual
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
     * Nota: Esta função retorna array vazio pois a tabela de serviços ainda não está implementada
     * A estrutura de dados será definida conforme necessário
     */
    private function getDecoratorServices($decoratorId) {
        try {
            // Retornar array vazio até que a tabela de serviços seja criada
            // TODO: Implementar tabela de serviços quando necessário
            return [];
            
        } catch (Exception $e) {
            error_log('Erro ao buscar serviços do decorador: ' . $e->getMessage());
            return [];
        }
    }
    
    /**
     * Buscar portfólio do decorador
     * Nota: Esta função retorna array vazio pois a tabela de portfólio ainda não está implementada
     * A estrutura de dados será definida conforme necessário
     */
    private function getDecoratorPortfolio($decoratorId) {
        try {
            // Retornar array vazio até que a tabela de portfólio seja criada
            // TODO: Implementar tabela de portfólio quando necessário
            return [];
            
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
            $requiredFields = ['nome', 'email', 'telefone', 'senha'];
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
            
            // Verificar se email já existe
            $stmt = $this->pdo->prepare("SELECT id FROM usuarios WHERE email = ?");
            $stmt->execute([$data['email']]);
            if ($stmt->fetch()) {
                return [
                    'success' => false,
                    'message' => 'Email já cadastrado'
                ];
            }
            
            // Gerar slug único
            $slug = generateUniqueSlug($this->pdo, $data['nome']);
            
            // Hash da senha
            $hashedPassword = password_hash($data['senha'], PASSWORD_DEFAULT);
            
            // Inserir decorador (usando estrutura da tabela usuarios do schema)
            $stmt = $this->pdo->prepare("
                INSERT INTO usuarios (
                    nome, email, telefone, senha, slug, is_active, created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, 1, NOW(), NOW())
            ");
            
            $stmt->execute([
                $data['nome'],
                $data['email'],
                $data['telefone'],
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
                WHERE id = ?
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
                    id, nome, email, telefone, 
                    slug, created_at
                FROM usuarios 
                WHERE is_active = 1
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
