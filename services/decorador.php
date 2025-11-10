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
    private $config;
    
    public function __construct($config) {
        $this->config = $config;
        try {
            $this->pdo = getDatabaseConnection($config);
        } catch (Exception $e) {
            throw new Exception('Erro de conexão com o banco de dados: ' . $e->getMessage());
        }
    }
    
    private function getBaseUrl(): string {
        $base = $GLOBALS['urls']['base'] ?? '';
        return rtrim($base, '/');
    }
    
    private function buildDecoratorUrl(string $slug): string {
        $path = '/pages/painel-decorador.html?decorator=' . urlencode($slug);
        $base = $this->getBaseUrl();
        
        if ($base === '') {
            return ltrim($path, '/');
        }
        
        return $base . $path;
    }
    
    private function decodeJsonField(?string $value, $default = []) {
        if ($value === null || $value === '') {
            return $default;
        }
        
        $decoded = json_decode($value, true);
        return is_array($decoded) ? $decoded : $default;
    }
    
    private function getPageCustomization(int $decoratorId): ?array {
        $stmt = $this->pdo->prepare("
            SELECT
                page_title,
                page_description,
                welcome_text,
                cover_image_url,
                primary_color,
                secondary_color,
                accent_color,
                services_config,
                social_media,
                meta_title,
                meta_description,
                meta_keywords,
                show_contact_section,
                show_services_section,
                show_portfolio_section,
                is_active,
                created_at,
                updated_at
            FROM decorator_page_customization
            WHERE decorator_id = ?
            LIMIT 1
        ");
        $stmt->execute([$decoratorId]);
        $row = $stmt->fetch();
        
        if (!$row) {
            return null;
        }
        
        return [
            'page_title' => $row['page_title'],
            'page_description' => $row['page_description'],
            'welcome_text' => $row['welcome_text'],
            'cover_image_url' => $row['cover_image_url'],
            'primary_color' => $row['primary_color'] ?? '#667eea',
            'secondary_color' => $row['secondary_color'] ?? '#764ba2',
            'accent_color' => $row['accent_color'] ?? '#f59e0b',
            'services' => $this->decodeJsonField($row['services_config']),
            'social_media' => $this->decodeJsonField($row['social_media']),
            'meta_title' => $row['meta_title'],
            'meta_description' => $row['meta_description'],
            'meta_keywords' => $row['meta_keywords'],
            'show_contact_section' => (bool)($row['show_contact_section'] ?? true),
            'show_services_section' => (bool)($row['show_services_section'] ?? true),
            'show_portfolio_section' => (bool)($row['show_portfolio_section'] ?? true),
            'is_active' => (bool)($row['is_active'] ?? true),
            'created_at' => $row['created_at'],
            'updated_at' => $row['updated_at'],
        ];
    }
    
    private function ensureDefaultCustomization(int $decoratorId, string $decoratorName): void {
        try {
            $stmt = $this->pdo->prepare("
                SELECT COUNT(*) 
                FROM decorator_page_customization 
                WHERE decorator_id = ?
            ");
            $stmt->execute([$decoratorId]);
            
            if ((int) $stmt->fetchColumn() > 0) {
                return;
            }
            
            $pageTitle = trim("Portfólio de {$decoratorName}");
            $welcomeText = trim("Conheça os trabalhos de {$decoratorName}.");
            
            $insert = $this->pdo->prepare("
                INSERT INTO decorator_page_customization (
                    decorator_id,
                    page_title,
                    welcome_text,
                    show_contact_section,
                    show_services_section,
                    show_portfolio_section,
                    created_at,
                    updated_at
                ) VALUES (?, ?, ?, 1, 1, 1, NOW(), NOW())
            ");
            
            $insert->execute([
                $decoratorId,
                $pageTitle,
                $welcomeText
            ]);
        } catch (Exception $e) {
            error_log('Erro ao criar personalização padrão do decorador: ' . $e->getMessage());
        }
    }
    
    /**
     * Buscar decorador por slug
     */
    public function getDecoratorBySlug($slug) {
        try {
            $stmt = $this->pdo->prepare("
                SELECT 
                    id,
                    nome,
                    email,
                    email_comunicacao,
                    telefone,
                    whatsapp,
                    instagram,
                    cpf,
                    endereco,
                    cidade,
                    estado,
                    cep,
                    slug,
                    perfil,
                    ativo,
                    aprovado_por_admin,
                    is_active,
                    bio,
                    especialidades,
                    portfolio_images,
                    redes_sociais,
                    created_at,
                    updated_at
                FROM usuarios 
                WHERE slug = ? AND is_active = 1
                LIMIT 1
            ");
            $stmt->execute([$slug]);
            $decorator = $stmt->fetch();
            
            if (!$decorator) {
                return [
                    'success' => false,
                    'message' => 'Decorador não encontrado'
                ];
            }
            
            $decoratorId = (int) $decorator['id'];
            $customization = $this->getPageCustomization($decoratorId);
            $services = $this->getDecoratorServices($decoratorId, $customization);
            $portfolio = $this->getDecoratorPortfolio($decoratorId);
            
            $communicationEmail = $decorator['email_comunicacao'] ?? $decorator['email'];
            
            $decoratorData = [
                'id' => $decoratorId,
                'name' => $decorator['nome'],
                'email' => $decorator['email'],
                'communication_email' => $communicationEmail,
                'phone' => $decorator['telefone'],
                'whatsapp' => $decorator['whatsapp'],
                'instagram' => $decorator['instagram'],
                'cpf' => $decorator['cpf'],
                'address' => $decorator['endereco'],
                'city' => $decorator['cidade'],
                'state' => $decorator['estado'],
                'zipcode' => $decorator['cep'],
                'slug' => $decorator['slug'],
                'profile' => $decorator['perfil'],
                'status' => ((int) $decorator['ativo'] === 1) ? 'active' : 'inactive',
                'approved_by_admin' => (bool) $decorator['aprovado_por_admin'],
                'is_active' => (bool) $decorator['is_active'],
                'bio' => $decorator['bio'],
                'specialties' => $this->decodeJsonField($decorator['especialidades']),
                'portfolio_images' => $this->decodeJsonField($decorator['portfolio_images']),
                'social_media' => $this->decodeJsonField($decorator['redes_sociais']),
                'created_at' => $decorator['created_at'],
                'updated_at' => $decorator['updated_at'],
                'url' => $this->buildDecoratorUrl($decorator['slug'])
            ];
            
            return [
                'success' => true,
                'data' => [
                    'decorator' => $decoratorData,
                    'customization' => $customization,
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
    private function getDecoratorServices(int $decoratorId, ?array $customization = null): array {
        try {
            $services = [];
            
            if ($customization && isset($customization['services']) && is_array($customization['services'])) {
                foreach ($customization['services'] as $index => $service) {
                    if (!is_array($service)) {
                        continue;
                    }
                    
                    $services[] = [
                        'id' => $service['id'] ?? ($index + 1),
                        'title' => $service['title'] ?? ($service['name'] ?? ''),
                        'description' => $service['description'] ?? '',
                        'icon' => $service['icon'] ?? null,
                        'price' => isset($service['price']) && $service['price'] !== '' ? (float) $service['price'] : null,
                        'highlight' => (bool) ($service['highlight'] ?? false)
                    ];
                }
            }
            
            return $services;
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
    private function getDecoratorPortfolio(int $decoratorId): array {
        try {
            $stmt = $this->pdo->prepare("
                SELECT 
                    id,
                    service_type,
                    title,
                    description,
                    price,
                    arc_size,
                    image_path,
                    display_order,
                    is_featured,
                    is_active,
                    created_at,
                    updated_at
                FROM decorator_portfolio_items
                WHERE decorator_id = ? AND is_active = 1
                ORDER BY display_order DESC, created_at DESC
            ");
            $stmt->execute([$decoratorId]);
            $items = $stmt->fetchAll() ?: [];
            
            $baseUrl = $this->getBaseUrl();
            $portfolio = [];
            
            foreach ($items as $item) {
                $relativePath = $item['image_path'] ?? null;
                $imageUrl = null;
                
                if ($relativePath) {
                    $normalizedPath = '/' . ltrim($relativePath, '/');
                    $imageUrl = $baseUrl !== ''
                        ? $baseUrl . $normalizedPath
                        : ltrim($normalizedPath, '/');
                }
                
                $portfolio[] = [
                    'id' => (int) $item['id'],
                    'type' => $item['service_type'],
                    'title' => $item['title'],
                    'description' => $item['description'],
                    'price' => $item['price'] !== null ? (float) $item['price'] : null,
                    'arc_size' => $item['arc_size'],
                    'image_path' => $relativePath,
                    'image_url' => $imageUrl,
                    'display_order' => (int) ($item['display_order'] ?? 0),
                    'is_featured' => (bool) ($item['is_featured'] ?? false),
                    'created_at' => $item['created_at'],
                    'updated_at' => $item['updated_at']
                ];
            }
            
            return $portfolio;
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
            $nome = trim($data['nome'] ?? '');
            $email = trim($data['email'] ?? '');
            $communicationEmail = trim($data['communication_email'] ?? $email);
            $telefone = trim($data['telefone'] ?? '');
            $whatsapp = trim($data['whatsapp'] ?? '');
            $senha = $data['senha'] ?? '';
            $cpf = trim($data['cpf'] ?? '');
            $endereco = trim($data['endereco'] ?? '');
            
            $requiredFields = [
                'nome' => $nome,
                'email' => $email,
                'telefone' => $telefone,
                'whatsapp' => $whatsapp,
                'senha' => $senha
            ];
            
            foreach ($requiredFields as $field => $value) {
                if ($value === '') {
                    return [
                        'success' => false,
                        'message' => "Campo {$field} é obrigatório"
                    ];
                }
            }
            
            if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
                return [
                    'success' => false,
                    'message' => 'Email inválido'
                ];
            }
            
            if ($communicationEmail !== '' && !filter_var($communicationEmail, FILTER_VALIDATE_EMAIL)) {
                return [
                    'success' => false,
                    'message' => 'E-mail para comunicação inválido'
                ];
            }
            
            if (strlen($senha) < 8) {
                return [
                    'success' => false,
                    'message' => 'Senha deve ter pelo menos 8 caracteres'
                ];
            }
            
            // Verificar email duplicado
            $stmt = $this->pdo->prepare("SELECT id FROM usuarios WHERE email = ?");
            $stmt->execute([$email]);
            if ($stmt->fetch()) {
                return [
                    'success' => false,
                    'message' => 'Email já cadastrado'
                ];
            }
            
            if ($communicationEmail !== '' && strcasecmp($communicationEmail, $email) !== 0) {
                $stmt = $this->pdo->prepare("SELECT id FROM usuarios WHERE email_comunicacao = ?");
                $stmt->execute([$communicationEmail]);
                if ($stmt->fetch()) {
                    return [
                        'success' => false,
                        'message' => 'E-mail para comunicação já cadastrado'
                    ];
                }
            }
            
            // Verificar whatsapp duplicado (opcional)
            if ($whatsapp !== '') {
                $stmt = $this->pdo->prepare("SELECT id FROM usuarios WHERE whatsapp = ?");
                $stmt->execute([$whatsapp]);
                if ($stmt->fetch()) {
                    return [
                        'success' => false,
                        'message' => 'WhatsApp já cadastrado'
                    ];
                }
            }
            
            // Gerar slug único
            $slug = generateUniqueSlug($this->pdo, $nome);
            
            // Hash da senha
            $hashedPassword = hashPassword($senha);
            
            $insert = $this->pdo->prepare("
                INSERT INTO usuarios (
                    nome,
                    email,
                    email_comunicacao,
                    telefone,
                    whatsapp,
                    cpf,
                    endereco,
                    senha,
                    slug,
                    perfil,
                    ativo,
                    aprovado_por_admin,
                    is_active,
                    is_admin,
                    created_at,
                    updated_at
                ) VALUES (
                    :nome,
                    :email,
                    :email_comunicacao,
                    :telefone,
                    :whatsapp,
                    :cpf,
                    :endereco,
                    :senha,
                    :slug,
                    'decorator',
                    1,
                    0,
                    1,
                    0,
                    NOW(),
                    NOW()
                )
            ");
            
            $insert->execute([
                ':nome' => $nome,
                ':email' => $email,
                ':email_comunicacao' => $communicationEmail !== '' ? $communicationEmail : $email,
                ':telefone' => $telefone,
                ':whatsapp' => $whatsapp,
                ':cpf' => $cpf !== '' ? $cpf : null,
                ':endereco' => $endereco !== '' ? $endereco : null,
                ':senha' => $hashedPassword,
                ':slug' => $slug
            ]);
            
            $decoratorId = (int) $this->pdo->lastInsertId();
            $this->ensureDefaultCustomization($decoratorId, $nome);
            
            return [
                'success' => true,
                'message' => 'Decorador criado com sucesso',
                'data' => [
                    'id' => $decoratorId,
                    'slug' => $slug,
                    'url' => $this->buildDecoratorUrl($slug),
                    'name' => $nome,
                    'email' => $email,
                    'communication_email' => $communicationEmail !== '' ? $communicationEmail : $email,
                    'whatsapp' => $whatsapp
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
                    'url' => $this->buildDecoratorUrl($slug)
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
                    id,
                    nome,
                    email,
                    email_comunicacao,
                    telefone,
                    whatsapp,
                    slug,
                    perfil,
                    ativo,
                    aprovado_por_admin,
                    created_at,
                    updated_at
                FROM usuarios 
                WHERE is_active = 1
                ORDER BY nome ASC
            ");
            $stmt->execute();
            $rows = $stmt->fetchAll() ?: [];
            
            $decorators = array_map(function ($decorator) {
                $communicationEmail = $decorator['email_comunicacao'] ?? $decorator['email'];
                
                return [
                    'id' => (int) $decorator['id'],
                    'name' => $decorator['nome'],
                    'email' => $decorator['email'],
                    'communication_email' => $communicationEmail,
                    'phone' => $decorator['telefone'],
                    'whatsapp' => $decorator['whatsapp'],
                    'slug' => $decorator['slug'],
                    'profile' => $decorator['perfil'],
                    'status' => ((int) $decorator['ativo'] === 1) ? 'active' : 'inactive',
                    'approved_by_admin' => (bool) $decorator['aprovado_por_admin'],
                    'created_at' => $decorator['created_at'],
                    'updated_at' => $decorator['updated_at'],
                    'url' => $this->buildDecoratorUrl($decorator['slug'])
                ];
            }, $rows);
            
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
