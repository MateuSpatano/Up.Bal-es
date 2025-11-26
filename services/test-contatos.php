<?php
/**
 * Script de teste para diagnosticar problemas no contatos.php
 */

// Habilitar exibição de erros
error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('log_errors', 1);

echo "<h1>Teste de Diagnóstico - contatos.php</h1>";
echo "<pre>";

// Teste 1: Verificar se config.php pode ser incluído
echo "1. Testando inclusão do config.php...\n";
try {
    require_once __DIR__ . '/config.php';
    echo "   ✓ config.php incluído com sucesso\n";
} catch (Throwable $e) {
    echo "   ✗ Erro ao incluir config.php: " . $e->getMessage() . "\n";
    echo "   Arquivo: " . $e->getFile() . "\n";
    echo "   Linha: " . $e->getLine() . "\n";
    exit;
}

// Teste 2: Verificar se $database_config existe
echo "\n2. Testando variável \$database_config...\n";
if (isset($database_config)) {
    echo "   ✓ \$database_config existe\n";
    echo "   Host: " . ($database_config['host'] ?? 'não definido') . "\n";
    echo "   Database: " . ($database_config['dbname'] ?? 'não definido') . "\n";
    echo "   Username: " . ($database_config['username'] ?? 'não definido') . "\n";
} else {
    echo "   ✗ \$database_config não existe\n";
    exit;
}

// Teste 3: Verificar se função getDatabaseConnection existe
echo "\n3. Testando função getDatabaseConnection...\n";
if (function_exists('getDatabaseConnection')) {
    echo "   ✓ Função getDatabaseConnection existe\n";
} else {
    echo "   ✗ Função getDatabaseConnection não existe\n";
    exit;
}

// Teste 4: Tentar conectar ao banco de dados
echo "\n4. Testando conexão com banco de dados...\n";
try {
    $pdo = getDatabaseConnection($database_config);
    echo "   ✓ Conexão estabelecida com sucesso\n";
} catch (Exception $e) {
    echo "   ✗ Erro ao conectar: " . $e->getMessage() . "\n";
    exit;
}

// Teste 5: Verificar se a tabela usuarios existe
echo "\n5. Testando existência da tabela usuarios...\n";
try {
    $stmt = $pdo->query("SHOW TABLES LIKE 'usuarios'");
    $tableExists = $stmt->fetch();
    if ($tableExists) {
        echo "   ✓ Tabela usuarios existe\n";
    } else {
        echo "   ✗ Tabela usuarios não existe\n";
        exit;
    }
} catch (PDOException $e) {
    echo "   ✗ Erro ao verificar tabela: " . $e->getMessage() . "\n";
    exit;
}

// Teste 6: Verificar estrutura da tabela
echo "\n6. Verificando estrutura da tabela usuarios...\n";
try {
    $stmt = $pdo->query("DESCRIBE usuarios");
    $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo "   Colunas encontradas:\n";
    $requiredColumns = ['email', 'email_comunicacao', 'whatsapp', 'instagram', 'telefone', 'perfil', 'ativo'];
    foreach ($columns as $col) {
        $colName = $col['Field'];
        $isRequired = in_array($colName, $requiredColumns);
        echo "   - $colName " . ($isRequired ? "✓" : "") . "\n";
    }
} catch (PDOException $e) {
    echo "   ✗ Erro ao verificar estrutura: " . $e->getMessage() . "\n";
    exit;
}

// Teste 7: Tentar executar a query
echo "\n7. Testando query de busca de contatos...\n";
try {
    $stmt = $pdo->prepare("
        SELECT 
            email,
            COALESCE(email_comunicacao, email) as email_comunicacao,
            COALESCE(whatsapp, telefone, '') as whatsapp,
            COALESCE(instagram, '') as instagram,
            COALESCE(telefone, '') as telefone,
            perfil
        FROM usuarios 
        WHERE (perfil = 'admin' OR perfil = 'decorator') 
        AND ativo = 1
        ORDER BY CASE WHEN perfil = 'admin' THEN 0 ELSE 1 END, created_at ASC 
        LIMIT 1
    ");
    
    $stmt->execute();
    $contact = $stmt->fetch();
    
    if ($contact) {
        echo "   ✓ Query executada com sucesso\n";
        echo "   Dados encontrados:\n";
        echo "   - Email: " . ($contact['email'] ?? 'não definido') . "\n";
        echo "   - WhatsApp: " . ($contact['whatsapp'] ?? 'não definido') . "\n";
        echo "   - Instagram: " . ($contact['instagram'] ?? 'não definido') . "\n";
    } else {
        echo "   ⚠ Query executada mas nenhum registro encontrado\n";
    }
} catch (PDOException $e) {
    echo "   ✗ Erro na query: " . $e->getMessage() . "\n";
    echo "   Código: " . $e->getCode() . "\n";
    
    // Tentar query alternativa
    echo "\n   Tentando query alternativa...\n";
    try {
        $stmt = $pdo->prepare("
            SELECT 
                email,
                email as email_comunicacao,
                COALESCE(whatsapp, telefone, '') as whatsapp,
                COALESCE(instagram, '') as instagram,
                COALESCE(telefone, '') as telefone,
                perfil
            FROM usuarios 
            WHERE perfil IN ('admin', 'decorator') 
            AND ativo = 1
            ORDER BY perfil = 'admin' DESC, created_at ASC 
            LIMIT 1
        ");
        $stmt->execute();
        $contact = $stmt->fetch();
        if ($contact) {
            echo "   ✓ Query alternativa funcionou\n";
        } else {
            echo "   ⚠ Query alternativa executada mas nenhum registro encontrado\n";
        }
    } catch (PDOException $e2) {
        echo "   ✗ Query alternativa também falhou: " . $e2->getMessage() . "\n";
    }
}

echo "\n</pre>";
echo "<h2>Teste concluído!</h2>";

