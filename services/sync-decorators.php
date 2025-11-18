<?php
/**
 * Script de Sincronização de JSONs de Decoradores
 * 
 * INSTRUÇÕES DE USO:
 * 1. Salve este arquivo como: services/sync-decorators.php
 * 2. Execute UMA VEZ via navegador: http://seudominio.com/Up.BaloesV3/services/sync-decorators.php
 * 3. Ou via terminal: php services/sync-decorators.php
 * 4. APÓS executar, DELETE este arquivo por segurança
 */

// Configurar exibição de erros
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Incluir configurações
require_once __DIR__ . '/config.php';

// Proteção: só executar se for chamada direta (não incluído por outro arquivo)
if (basename($_SERVER['PHP_SELF']) !== 'sync-decorators.php') {
    die('Este script só pode ser executado diretamente.');
}

// Header para exibição HTML
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sincronização de Decoradores - Up.Baloes</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 50px auto;
            padding: 20px;
            background: #f5f5f5;
        }
        .container {
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        h1 {
            color: #667eea;
            margin-bottom: 20px;
        }
        .status {
            padding: 15px;
            margin: 10px 0;
            border-radius: 5px;
            border-left: 4px solid;
        }
        .success {
            background: #d4edda;
            border-color: #28a745;
            color: #155724;
        }
        .error {
            background: #f8d7da;
            border-color: #dc3545;
            color: #721c24;
        }
        .info {
            background: #d1ecf1;
            border-color: #17a2b8;
            color: #0c5460;
        }
        .warning {
            background: #fff3cd;
            border-color: #ffc107;
            color: #856404;
        }
        .details {
            background: #f8f9fa;
            padding: 15px;
            margin: 15px 0;
            border-radius: 5px;
            font-family: monospace;
            font-size: 12px;
        }
        .btn {
            display: inline-block;
            padding: 10px 20px;
            background: #667eea;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            margin-top: 20px;
        }
        .btn:hover {
            background: #5568d3;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🎈 Sincronização de Decoradores</h1>
        
        <?php
        try {
            echo '<div class="status info">';
            echo '<strong>Iniciando sincronização...</strong>';
            echo '</div>';
            
            // Conectar ao banco de dados
            $pdo = getDatabaseConnection($database_config);
            
            echo '<div class="status info">';
            echo '✓ Conexão com banco de dados estabelecida';
            echo '</div>';
            
            // Criar diretório de dados se não existir
            $dataDir = __DIR__ . '/../data/decorators';
            if (!is_dir($dataDir)) {
                if (mkdir($dataDir, 0755, true)) {
                    echo '<div class="status success">';
                    echo '✓ Diretório criado: ' . $dataDir;
                    echo '</div>';
                } else {
                    throw new Exception('Não foi possível criar o diretório: ' . $dataDir);
                }
            } else {
                echo '<div class="status info">';
                echo '✓ Diretório existe: ' . $dataDir;
                echo '</div>';
            }
            
            // Buscar todos os decoradores ativos e aprovados
            $stmt = $pdo->prepare("
                SELECT 
                    u.id,
                    u.nome,
                    u.slug,
                    u.email,
                    u.whatsapp,
                    u.ativo,
                    u.aprovado_por_admin
                FROM usuarios u
                WHERE u.perfil = 'decorator'
                ORDER BY u.nome ASC
            ");
            $stmt->execute();
            $decorators = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            echo '<div class="status info">';
            echo '✓ Total de decoradores encontrados: ' . count($decorators);
            echo '</div>';
            
            $details = [];
            $synced = 0;
            $skipped = 0;
            $errors = 0;
            
            foreach ($decorators as $decorator) {
                $decoratorName = $decorator['nome'];
                $decoratorSlug = $decorator['slug'];
                $jsonFilePath = $dataDir . '/' . $decoratorSlug . '.json';
                
                // Verificar se está ativo e aprovado
                if (!$decorator['ativo'] || !$decorator['aprovado_por_admin']) {
                    $details[] = "⊘ PULADO: {$decoratorName} (slug: {$decoratorSlug}) - Inativo ou não aprovado";
                    $skipped++;
                    continue;
                }
                
                // Verificar se slug existe
                if (empty($decoratorSlug)) {
                    $details[] = "✗ ERRO: {$decoratorName} - Slug vazio";
                    $errors++;
                    continue;
                }
                
                // Verificar se JSON já existe
                if (file_exists($jsonFilePath)) {
                    $details[] = "○ JÁ EXISTE: {$decoratorName} (slug: {$decoratorSlug})";
                    $skipped++;
                    continue;
                }
                
                try {
                    // Buscar personalização do banco
                    $stmt = $pdo->prepare("
                        SELECT 
                            page_title,
                            page_description,
                            welcome_text,
                            primary_color,
                            secondary_color,
                            accent_color,
                            services_config,
                            social_media,
                            meta_title,
                            meta_description,
                            meta_keywords
                        FROM decorator_page_customization
                        WHERE decorator_id = ?
                    ");
                    $stmt->execute([$decorator['id']]);
                    $customization = $stmt->fetch(PDO::FETCH_ASSOC);
                    
                    // Se não existe personalização, criar padrão
                    if (!$customization) {
                        $customization = [
                            'page_title' => "Bem-vindo à {$decoratorName}!",
                            'page_description' => "Decoração profissional com balões para eventos",
                            'welcome_text' => "Bem-vindo à minha página de decoração! Estamos prontos para tornar seu evento único e especial.",
                            'primary_color' => '#667eea',
                            'secondary_color' => '#764ba2',
                            'accent_color' => '#f59e0b',
                            'services_config' => json_encode([
                                ['id' => 1, 'title' => 'Arco Desconstruído', 'description' => 'Arcos modernos com design desconstruído', 'icon' => 'fas fa-palette'],
                                ['id' => 2, 'title' => 'Arco Tradicional', 'description' => 'Arcos de balões tradicionais', 'icon' => 'fas fa-archway'],
                                ['id' => 3, 'title' => 'Escultura de Balão', 'description' => 'Esculturas personalizadas', 'icon' => 'fas fa-sculpture']
                            ]),
                            'social_media' => json_encode([
                                'whatsapp' => $decorator['whatsapp'] ?? '',
                                'email' => $decorator['email'] ?? '',
                                'instagram' => '',
                                'facebook' => '',
                                'youtube' => ''
                            ]),
                            'meta_title' => "{$decoratorName} - Decoração com Balões",
                            'meta_description' => "Conheça {$decoratorName}. Decoração profissional com balões.",
                            'meta_keywords' => 'decorador, festas, balões, eventos, decoração'
                        ];
                    }
                    
                    // Criar JSON
                    $jsonData = [
                        'id' => (int) $decorator['id'],
                        'name' => $decoratorName,
                        'slug' => $decoratorSlug,
                        'email' => $decorator['email'],
                        'whatsapp' => $decorator['whatsapp'],
                        'customization' => [
                            'page_title' => $customization['page_title'],
                            'page_description' => $customization['page_description'],
                            'welcome_text' => $customization['welcome_text'],
                            'primary_color' => $customization['primary_color'],
                            'secondary_color' => $customization['secondary_color'],
                            'accent_color' => $customization['accent_color'],
                            'meta_title' => $customization['meta_title'],
                            'meta_description' => $customization['meta_description'],
                            'meta_keywords' => $customization['meta_keywords']
                        ],
                        'services' => json_decode($customization['services_config'] ?? '[]', true),
                        'social_media' => json_decode($customization['social_media'] ?? '{}', true),
                        'portfolio' => [],
                        'active' => true,
                        'approved' => true,
                        'created_at' => date('Y-m-d H:i:s'),
                        'updated_at' => date('Y-m-d H:i:s')
                    ];
                    
                    // Salvar JSON
                    $jsonContent = json_encode($jsonData, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
                    if (file_put_contents($jsonFilePath, $jsonContent) !== false) {
                        $details[] = "✓ CRIADO: {$decoratorName} (slug: {$decoratorSlug})";
                        $synced++;
                    } else {
                        $details[] = "✗ ERRO: {$decoratorName} - Não foi possível salvar JSON";
                        $errors++;
                    }
                    
                } catch (Exception $e) {
                    $details[] = "✗ ERRO: {$decoratorName} - " . $e->getMessage();
                    $errors++;
                }
            }
            
            // Criar/atualizar arquivo decorators.json (lista completa)
            try {
                $stmt = $pdo->prepare("
                    SELECT 
                        u.id,
                        u.nome,
                        u.slug,
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
                $activeDecorators = $stmt->fetchAll(PDO::FETCH_ASSOC);
                
                $decoratorsList = [];
                foreach ($activeDecorators as $dec) {
                    $decoratorsList[] = [
                        'id' => (int) $dec['id'],
                        'name' => $dec['nome'],
                        'slug' => $dec['slug'],
                        'title' => $dec['page_title'] ?? "Bem-vindo à {$dec['nome']}!",
                        'description' => $dec['page_description'] ?? "Decoração profissional com balões",
                        'url' => '/' . $dec['slug']
                    ];
                }
                
                $listContent = json_encode([
                    'decorators' => $decoratorsList,
                    'total' => count($decoratorsList),
                    'updated_at' => date('Y-m-d H:i:s')
                ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
                
                $listFilePath = $dataDir . '/decorators.json';
                if (file_put_contents($listFilePath, $listContent) !== false) {
                    echo '<div class="status success">';
                    echo '✓ Arquivo decorators.json criado/atualizado';
                    echo '</div>';
                } else {
                    echo '<div class="status warning">';
                    echo '⚠ Não foi possível criar decorators.json';
                    echo '</div>';
                }
            } catch (Exception $e) {
                echo '<div class="status warning">';
                echo '⚠ Erro ao criar decorators.json: ' . $e->getMessage();
                echo '</div>';
            }
            
            // Mostrar resumo
            echo '<div class="status ' . ($errors > 0 ? 'warning' : 'success') . '">';
            echo '<strong>Resumo da Sincronização:</strong><br>';
            echo '• JSONs criados: ' . $synced . '<br>';
            echo '• Já existiam: ' . $skipped . '<br>';
            echo '• Erros: ' . $errors . '<br>';
            echo '• Total processado: ' . count($decorators);
            echo '</div>';
            
            // Mostrar detalhes
            if (!empty($details)) {
                echo '<div class="details">';
                echo '<strong>Detalhes:</strong><br><br>';
                echo implode('<br>', $details);
                echo '</div>';
            }
            
            echo '<div class="status success">';
            echo '<strong>✓ Sincronização concluída!</strong><br>';
            echo 'Os arquivos JSON dos decoradores foram criados em: <code>' . $dataDir . '</code>';
            echo '</div>';
            
            echo '<div class="status warning">';
            echo '<strong>⚠ IMPORTANTE:</strong> Por segurança, DELETE este arquivo após a sincronização:<br>';
            echo '<code>services/sync-decorators.php</code>';
            echo '</div>';
            
        } catch (PDOException $e) {
            echo '<div class="status error">';
            echo '<strong>Erro de banco de dados:</strong><br>';
            echo $e->getMessage();
            echo '</div>';
        } catch (Exception $e) {
            echo '<div class="status error">';
            echo '<strong>Erro:</strong><br>';
            echo $e->getMessage();
            echo '</div>';
        }
        ?>
        
        <a href="../index.html" class="btn">← Voltar para a página inicial</a>
    </div>
</body>
</html>