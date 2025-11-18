<?php
/**
 * CORREÇÃO: Adicionar ao services/admin.php
 * 
 * Substitua a função createDefaultPageCustomization existente por esta versão corrigida
 * que cria tanto o registro no banco quanto o arquivo JSON físico
 */

/**
 * Criar personalização padrão da página para um novo decorador
 */
function createDefaultPageCustomization($pdo, $decoratorId, $decoratorName, $email, $whatsapp) {
    try {
        // Verificar se já existe personalização para este decorador
        $stmt = $pdo->prepare("SELECT id FROM decorator_page_customization WHERE decorator_id = ?");
        $stmt->execute([$decoratorId]);
        if ($stmt->fetch()) {
            // Já existe personalização, não criar novamente
            error_log("Personalização já existe para decorador ID: {$decoratorId}");
            return;
        }
        
        // Buscar slug do decorador
        $stmt = $pdo->prepare("SELECT slug FROM usuarios WHERE id = ?");
        $stmt->execute([$decoratorId]);
        $decoratorData = $stmt->fetch();
        $slug = $decoratorData['slug'] ?? '';
        
        if (empty($slug)) {
            error_log("ERRO: Slug vazio para decorador ID: {$decoratorId}");
            return;
        }
        
        // Criar personalização padrão baseada no index.html
        $defaultTitle = "Bem-vindo à {$decoratorName}!";
        $defaultDescription = "Decoração profissional com balões para eventos. Transforme seus momentos especiais em memórias inesquecíveis.";
        // Texto de boas-vindas genérico
        $defaultWelcomeText = "Bem-vindo à minha página de decoração! Estamos prontos para tornar seu evento único e especial. Oferecemos serviços de decoração com balões personalizados para todos os tipos de celebrações.";
        
        // Configuração padrão de redes sociais (puxando WhatsApp e Email cadastrados)
        $defaultSocialMedia = json_encode([
            'whatsapp' => $whatsapp ?? '',
            'email' => $email ?? '',
            'instagram' => '',
            'facebook' => '',
            'youtube' => ''
        ]);
        
        // Configuração padrão de serviços (Arco Desconstruído primeiro, depois Arco Tradicional)
        $defaultServices = json_encode([
            [
                'id' => 1,
                'title' => 'Arco Desconstruído',
                'description' => 'Arcos modernos com design desconstruído',
                'icon' => 'fas fa-palette',
                'price' => null,
                'highlight' => false
            ],
            [
                'id' => 2,
                'title' => 'Arco Tradicional',
                'description' => 'Arcos de balões tradicionais para decoração de eventos',
                'icon' => 'fas fa-archway',
                'price' => null,
                'highlight' => false
            ],
            [
                'id' => 3,
                'title' => 'Escultura de Balão',
                'description' => 'Esculturas personalizadas com balões',
                'icon' => 'fas fa-sculpture',
                'price' => null,
                'highlight' => false
            ]
        ]);
        
        // Inserir personalização padrão no banco de dados
        $stmt = $pdo->prepare("
            INSERT INTO decorator_page_customization (
                decorator_id,
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
            ) VALUES (
                ?,
                ?,
                ?,
                ?,
                NULL,
                '#667eea',
                '#764ba2',
                '#f59e0b',
                ?,
                ?,
                ?,
                ?,
                'decorador, festas, balões, eventos, decoração',
                1,
                1,
                1,
                1,
                NOW(),
                NOW()
            )
        ");
        
        $metaTitle = "{$decoratorName} - Decoração com Balões | Up.Baloes";
        $metaDescription = "Conheça {$decoratorName}. Decoração profissional com balões para eventos. Transforme seus momentos especiais em memórias inesquecíveis.";
        
        $stmt->execute([
            $decoratorId,
            $defaultTitle,
            $defaultDescription,
            $defaultWelcomeText,
            $defaultServices,
            $defaultSocialMedia,
            $metaTitle,
            $metaDescription
        ]);
        
        error_log("Personalização padrão criada no banco para decorador ID: {$decoratorId}");
        
        // ========================================
        // CRIAR ARQUIVO JSON FÍSICO
        // ========================================
        
        // Criar diretório de dados se não existir
        $dataDir = __DIR__ . '/../data/decorators';
        if (!is_dir($dataDir)) {
            mkdir($dataDir, 0755, true);
            error_log("Diretório criado: {$dataDir}");
        }
        
        // Criar dados do JSON
        $jsonData = [
            'id' => $decoratorId,
            'name' => $decoratorName,
            'slug' => $slug,
            'email' => $email,
            'whatsapp' => $whatsapp,
            'customization' => [
                'page_title' => $defaultTitle,
                'page_description' => $defaultDescription,
                'welcome_text' => $defaultWelcomeText,
                'primary_color' => '#667eea',
                'secondary_color' => '#764ba2',
                'accent_color' => '#f59e0b',
                'meta_title' => $metaTitle,
                'meta_description' => $metaDescription,
                'meta_keywords' => 'decorador, festas, balões, eventos, decoração'
            ],
            'services' => json_decode($defaultServices, true),
            'social_media' => json_decode($defaultSocialMedia, true),
            'portfolio' => [],
            'active' => true,
            'approved' => true,
            'created_at' => date('Y-m-d H:i:s'),
            'updated_at' => date('Y-m-d H:i:s')
        ];
        
        // Salvar arquivo JSON individual do decorador
        $jsonFilePath = $dataDir . '/' . $slug . '.json';
        $jsonContent = json_encode($jsonData, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
        
        if (file_put_contents($jsonFilePath, $jsonContent) === false) {
            error_log("ERRO: Não foi possível criar arquivo JSON: {$jsonFilePath}");
        } else {
            error_log("Arquivo JSON criado com sucesso: {$jsonFilePath}");
        }
        
        // Atualizar ou criar arquivo decorators.json com lista de todos os decoradores
        updateDecoratorsListJson($pdo, $dataDir);
        
    } catch (PDOException $e) {
        error_log("Erro ao criar personalização padrão para decorador {$decoratorId}: " . $e->getMessage());
        error_log("Stack trace: " . $e->getTraceAsString());
    } catch (Exception $e) {
        error_log("Erro ao criar personalização padrão para decorador {$decoratorId}: " . $e->getMessage());
        error_log("Stack trace: " . $e->getTraceAsString());
    }
}

/**
 * Atualizar arquivo decorators.json com lista de todos os decoradores ativos
 */
function updateDecoratorsListJson($pdo, $dataDir) {
    try {
        // Buscar todos os decoradores ativos e aprovados
        $stmt = $pdo->prepare("
            SELECT 
                u.id,
                u.nome,
                u.slug,
                u.email,
                u.whatsapp,
                dpc.page_title,
                dpc.page_description
            FROM usuarios u
            LEFT JOIN decorator_page_customization dpc ON u.id = dpc.decorator_id
            WHERE u.perfil = 'decorator' 
            AND u.ativo = 1 
            AND u.aprovado_por_admin = 1
            ORDER BY u.nome ASC
        ");
        $stmt->execute();
        $decorators = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Formatar dados para JSON
        $decoratorsList = [];
        foreach ($decorators as $decorator) {
            $decoratorsList[] = [
                'id' => (int) $decorator['id'],
                'name' => $decorator['nome'],
                'slug' => $decorator['slug'],
                'title' => $decorator['page_title'] ?? "Bem-vindo à {$decorator['nome']}!",
                'description' => $decorator['page_description'] ?? "Decoração profissional com balões",
                'url' => '/' . $decorator['slug']
            ];
        }
        
        // Salvar arquivo decorators.json
        $listFilePath = $dataDir . '/decorators.json';
        $listContent = json_encode([
            'decorators' => $decoratorsList,
            'total' => count($decoratorsList),
            'updated_at' => date('Y-m-d H:i:s')
        ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
        
        if (file_put_contents($listFilePath, $listContent) === false) {
            error_log("ERRO: Não foi possível atualizar arquivo decorators.json");
        } else {
            error_log("Arquivo decorators.json atualizado com sucesso. Total de decoradores: " . count($decoratorsList));
        }
        
    } catch (Exception $e) {
        error_log("Erro ao atualizar decorators.json: " . $e->getMessage());
    }
}

/**
 * NOVA FUNÇÃO: Sincronizar JSONs de todos os decoradores
 * Execute esta função após a correção para criar JSONs de decoradores existentes
 */
function syncAllDecoratorsJson($pdo) {
    try {
        // Buscar todos os decoradores ativos e aprovados
        $stmt = $pdo->prepare("
            SELECT 
                u.id,
                u.nome,
                u.slug,
                u.email,
                u.whatsapp
            FROM usuarios u
            WHERE u.perfil = 'decorator' 
            AND u.ativo = 1 
            AND u.aprovado_por_admin = 1
        ");
        $stmt->execute();
        $decorators = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        $synced = 0;
        $errors = 0;
        
        foreach ($decorators as $decorator) {
            // Verificar se já existe JSON
            $dataDir = __DIR__ . '/../data/decorators';
            $jsonFilePath = $dataDir . '/' . $decorator['slug'] . '.json';
            
            if (!file_exists($jsonFilePath)) {
                // Criar JSON para este decorador
                createDefaultPageCustomization(
                    $pdo,
                    $decorator['id'],
                    $decorator['nome'],
                    $decorator['email'],
                    $decorator['whatsapp']
                );
                $synced++;
            }
        }
        
        error_log("Sincronização concluída. JSONs criados: {$synced}");
        
        return [
            'success' => true,
            'synced' => $synced,
            'total' => count($decorators)
        ];
        
    } catch (Exception $e) {
        error_log("Erro na sincronização: " . $e->getMessage());
        return [
            'success' => false,
            'error' => $e->getMessage()
        ];
    }
}