<?php
/**
 * Serviço de Decorador - Up.Baloes
 * Classe para gerenciar operações relacionadas aos decoradores
 */

class DecoratorService {
    private $pdo;
    
    public function __construct($config) {
        try {
            $this->pdo = getDatabaseConnection($config);
        } catch (Exception $e) {
            throw new Exception('Erro de conexão com o banco de dados: ' . $e->getMessage());
        }
    }
    
    /**
     * Obter decorador por slug com todas as informações relacionadas
     */
    public function getDecoratorBySlug($slug) {
        try {
            error_log("DecoratorService::getDecoratorBySlug - Buscando decorador com slug: " . $slug);
            
            // Buscar decorador pelo slug
            // Remover colunas que podem não existir: whatsapp, instagram
            $stmt = $this->pdo->prepare("
                SELECT 
                    id, nome as name, email, 
                    COALESCE(email_comunicacao, email) as communication_email,
                    telefone, slug, bio, especialidades,
                    perfil, ativo, aprovado_por_admin, redes_sociais
                FROM usuarios 
                WHERE slug = ? 
                AND perfil = 'decorator'
                AND ativo = 1
                AND aprovado_por_admin = 1
            ");
            
            $stmt->execute([$slug]);
            $decorator = $stmt->fetch();
            
            if (!$decorator) {
                // Tentar buscar sem os filtros de ativo/aprovado para debug
                $debugStmt = $this->pdo->prepare("
                    SELECT id, nome, slug, perfil, ativo, aprovado_por_admin 
                    FROM usuarios 
                    WHERE slug = ? AND perfil = 'decorator'
                ");
                $debugStmt->execute([$slug]);
                $debugDecorator = $debugStmt->fetch();
                
                if ($debugDecorator) {
                    error_log("Decorador encontrado mas com status incorreto - ID: {$debugDecorator['id']}, Ativo: {$debugDecorator['ativo']}, Aprovado: {$debugDecorator['aprovado_por_admin']}");
                } else {
                    error_log("Nenhum decorador encontrado com slug: " . $slug);
                }
                
                return [
                    'success' => false,
                    'message' => 'Decorador não encontrado ou aguardando aprovação'
                ];
            }
            
            error_log("Decorador encontrado com sucesso - ID: {$decorator['id']}, Nome: {$decorator['name']}");
            
            // Buscar customização da página
            $stmt = $this->pdo->prepare("
                SELECT 
                    page_title, page_description, welcome_text, cover_image_url,
                    primary_color, secondary_color, accent_color,
                    services_config, social_media,
                    meta_title, meta_description, meta_keywords,
                    show_contact_section, show_services_section, show_portfolio_section
                FROM decorator_page_customization
                WHERE decorator_id = ? AND is_active = 1
            ");
            
            $stmt->execute([$decorator['id']]);
            $customization = $stmt->fetch();
            
            // Se não houver customização, criar uma padrão
            if (!$customization) {
                $customization = [
                    'page_title' => null,
                    'page_description' => null,
                    'welcome_text' => null,
                    'cover_image_url' => null,
                    'primary_color' => '#667eea',
                    'secondary_color' => '#764ba2',
                    'accent_color' => '#f59e0b',
                    'services_config' => null,
                    'social_media' => null,
                    'meta_title' => null,
                    'meta_description' => null,
                    'meta_keywords' => null,
                    'show_contact_section' => true,
                    'show_services_section' => true,
                    'show_portfolio_section' => true
                ];
            }
            
            // Processar JSON fields
            if (!empty($customization['services_config'])) {
                $servicesConfig = json_decode($customization['services_config'], true);
                $customization['services'] = $servicesConfig ?: [];
            } else {
                $customization['services'] = [];
            }
            
            if (!empty($customization['social_media'])) {
                $socialMedia = json_decode($customization['social_media'], true);
                $customization['social_media'] = $socialMedia ?: [];
            } else {
                $customization['social_media'] = [];
            }
            
            // Buscar itens do portfólio
            $stmt = $this->pdo->prepare("
                SELECT 
                    id, service_type, title, description, price,
                    arc_size, image_path, display_order,
                    is_featured, is_active
                FROM decorator_portfolio_items
                WHERE decorator_id = ? AND is_active = 1
                ORDER BY display_order ASC, created_at DESC
            ");
            
            $stmt->execute([$decorator['id']]);
            $portfolio = $stmt->fetchAll();
            
            // Processar caminhos das imagens
            global $urls;
            $baseUrl = rtrim($urls['base'] ?? '', '/') . '/';
            foreach ($portfolio as &$item) {
                if (!empty($item['image_path'])) {
                    // Construir URL completa da imagem
                    $item['image_url'] = $baseUrl . ltrim($item['image_path'], '/');
                } else {
                    $item['image_url'] = null;
                }
            }
            unset($item); // Limpar referência
            
            // Processar redes sociais do decorador se não houver na customização
            if (empty($customization['social_media']) && !empty($decorator['redes_sociais'])) {
                $redesSociais = json_decode($decorator['redes_sociais'], true);
                if ($redesSociais) {
                    $customization['social_media'] = $redesSociais;
                }
            }
            
            return [
                'success' => true,
                'data' => [
                    'decorator' => $decorator,
                    'customization' => $customization,
                    'services' => $customization['services'] ?? [],
                    'portfolio' => $portfolio
                ]
            ];
            
        } catch (Exception $e) {
            error_log('Erro ao buscar decorador por slug: ' . $e->getMessage());
            return [
                'success' => false,
                'message' => 'Erro ao buscar decorador: ' . $e->getMessage()
            ];
        }
    }
}

