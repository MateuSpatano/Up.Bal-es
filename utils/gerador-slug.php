<?php
/**
 * Utilitário para geração de slugs únicos
 * 
 * Este arquivo contém funções para gerar slugs amigáveis
 * a partir de nomes e textos.
 */

/**
 * Gera um slug amigável a partir de um texto
 * 
 * @param string $text Texto para converter em slug
 * @param int $maxLength Tamanho máximo do slug
 * @return string Slug gerado
 */
function generateSlug($text, $maxLength = 80) {
    // Converter para minúsculas
    $slug = strtolower($text);
    
    // Remover acentos
    $slug = removeAccents($slug);
    
    // Remover caracteres especiais e substituir espaços por hífens
    $slug = preg_replace('/[^a-z0-9\s-]/', '', $slug);
    $slug = preg_replace('/[\s-]+/', '-', $slug);
    
    // Remover hífens do início e fim
    $slug = trim($slug, '-');
    
    // Limitar tamanho
    if (strlen($slug) > $maxLength) {
        $slug = substr($slug, 0, $maxLength);
        $slug = rtrim($slug, '-');
    }
    
    return $slug;
}

/**
 * Remove acentos de uma string
 * 
 * @param string $string String com acentos
 * @return string String sem acentos
 */
function removeAccents($string) {
    $accents = [
        'á' => 'a', 'à' => 'a', 'ã' => 'a', 'â' => 'a', 'ä' => 'a',
        'é' => 'e', 'è' => 'e', 'ê' => 'e', 'ë' => 'e',
        'í' => 'i', 'ì' => 'i', 'î' => 'i', 'ï' => 'i',
        'ó' => 'o', 'ò' => 'o', 'õ' => 'o', 'ô' => 'o', 'ö' => 'o',
        'ú' => 'u', 'ù' => 'u', 'û' => 'u', 'ü' => 'u',
        'ç' => 'c', 'ñ' => 'n',
        'Á' => 'A', 'À' => 'A', 'Ã' => 'A', 'Â' => 'A', 'Ä' => 'A',
        'É' => 'E', 'È' => 'E', 'Ê' => 'E', 'Ë' => 'E',
        'Í' => 'I', 'Ì' => 'I', 'Î' => 'I', 'Ï' => 'I',
        'Ó' => 'O', 'Ò' => 'O', 'Õ' => 'O', 'Ô' => 'O', 'Ö' => 'O',
        'Ú' => 'U', 'Ù' => 'U', 'Û' => 'U', 'Ü' => 'U',
        'Ç' => 'C', 'Ñ' => 'N'
    ];
    
    return strtr($string, $accents);
}

/**
 * Gera um slug único verificando se já existe no banco
 * 
 * @param PDO $pdo Conexão com o banco de dados
 * @param string $text Texto para converter em slug
 * @param string $table Nome da tabela
 * @param string $column Nome da coluna slug
 * @param int $excludeId ID para excluir da verificação (para updates)
 * @return string Slug único
 */
function generateUniqueSlug($pdo, $text, $table = 'usuarios', $column = 'slug', $excludeId = null) {
    $baseSlug = generateSlug($text);
    $slug = $baseSlug;
    $counter = 0;
    
    do {
        $sql = "SELECT id FROM {$table} WHERE {$column} = ?";
        $params = [$slug];
        
        if ($excludeId !== null) {
            $sql .= " AND id != ?";
            $params[] = $excludeId;
        }
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        
        if ($stmt->fetch()) {
            $counter++;
            $slug = $baseSlug . '-' . $counter;
        } else {
            break;
        }
    } while (true);
    
    return $slug;
}

/**
 * Valida se um slug é válido
 * 
 * @param string $slug Slug para validar
 * @return bool True se válido, false caso contrário
 */
function isValidSlug($slug) {
    // Slug deve ter entre 1 e 100 caracteres
    if (strlen($slug) < 1 || strlen($slug) > 100) {
        return false;
    }
    
    // Slug deve conter apenas letras minúsculas, números e hífens
    if (!preg_match('/^[a-z0-9-]+$/', $slug)) {
        return false;
    }
    
    // Slug não pode começar ou terminar com hífen
    if (substr($slug, 0, 1) === '-' || substr($slug, -1) === '-') {
        return false;
    }
    
    // Slug não pode ter hífens consecutivos
    if (strpos($slug, '--') !== false) {
        return false;
    }
    
    return true;
}

/**
 * Sanitiza um slug removendo caracteres inválidos
 * 
 * @param string $slug Slug para sanitizar
 * @return string Slug sanitizado
 */
function sanitizeSlug($slug) {
    // Converter para minúsculas
    $slug = strtolower($slug);
    
    // Remover caracteres inválidos
    $slug = preg_replace('/[^a-z0-9-]/', '', $slug);
    
    // Remover hífens consecutivos
    $slug = preg_replace('/-+/', '-', $slug);
    
    // Remover hífens do início e fim
    $slug = trim($slug, '-');
    
    return $slug;
}
?>
