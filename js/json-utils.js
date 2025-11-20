/**
 * Utilitários para tratamento seguro de JSON
 * Up.Baloes - Sistema de tratamento de JSON robusto
 */

/**
 * Faz parse seguro de uma string JSON
 * @param {string} jsonString - String JSON para fazer parse
 * @param {*} defaultValue - Valor padrão caso o parse falhe
 * @returns {*} Objeto parseado ou valor padrão
 */
function safeJsonParse(jsonString, defaultValue = null) {
    if (!jsonString || typeof jsonString !== 'string') {
        return defaultValue;
    }

    const trimmed = jsonString.trim();
    if (trimmed === '' || trimmed === 'null') {
        return defaultValue;
    }

    try {
        return JSON.parse(trimmed);
    } catch (error) {
        console.warn('Erro ao fazer parse JSON:', error.message);
        console.warn('String JSON:', jsonString.substring(0, 100));
        return defaultValue;
    }
}

/**
 * Faz parse seguro de uma resposta fetch
 * @param {Response} response - Objeto Response do fetch
 * @param {*} defaultValue - Valor padrão caso o parse falhe
 * @returns {Promise<*>} Promise que resolve com o objeto parseado ou valor padrão
 */
async function safeResponseJson(response, defaultValue = null) {
    if (!response || !(response instanceof Response)) {
        console.warn('safeResponseJson: resposta inválida');
        return defaultValue;
    }

    try {
        const contentType = response.headers.get('content-type') || '';
        const text = await response.text();

        // Se a resposta estiver vazia
        if (!text || text.trim() === '') {
            console.warn('Resposta vazia do servidor');
            return defaultValue;
        }

        // Verificar se é JSON válido
        if (contentType.includes('application/json')) {
            try {
                return JSON.parse(text);
            } catch (parseError) {
                console.error('Erro ao fazer parse JSON da resposta');
                console.error('Erro:', parseError.message);
                console.error('Resposta raw (primeiros 200 chars):', text.substring(0, 200));
                return defaultValue;
            }
        } else {
            // Se não for JSON mas tiver conteúdo, tentar fazer parse mesmo assim
            // (alguns servidores não enviam o Content-Type correto)
            try {
                const parsed = JSON.parse(text);
                return parsed;
            } catch (e) {
                console.warn('Resposta não é JSON válido. Content-Type:', contentType);
                console.warn('Resposta raw (primeiros 200 chars):', text.substring(0, 200));
                return defaultValue;
            }
        }
    } catch (error) {
        console.error('Erro ao processar resposta:', error);
        return defaultValue;
    }
}

/**
 * Faz parse seguro de dados do localStorage
 * @param {string} key - Chave do localStorage
 * @param {*} defaultValue - Valor padrão caso não exista ou o parse falhe
 * @returns {*} Objeto parseado ou valor padrão
 */
function safeLocalStorageParse(key, defaultValue = null) {
    try {
        const item = localStorage.getItem(key);
        if (!item) {
            return defaultValue;
        }
        return safeJsonParse(item, defaultValue);
    } catch (error) {
        console.warn(`Erro ao ler localStorage[${key}]:`, error);
        return defaultValue;
    }
}

/**
 * Serializa um objeto para JSON de forma segura
 * @param {*} obj - Objeto para serializar
 * @param {*} defaultValue - Valor padrão caso a serialização falhe
 * @returns {string} String JSON ou valor padrão
 */
function safeJsonStringify(obj, defaultValue = '{}') {
    try {
        return JSON.stringify(obj);
    } catch (error) {
        console.warn('Erro ao serializar objeto para JSON:', error);
        return defaultValue;
    }
}

// Exportar funções para uso global
if (typeof window !== 'undefined') {
    window.safeJsonParse = safeJsonParse;
    window.safeResponseJson = safeResponseJson;
    window.safeLocalStorageParse = safeLocalStorageParse;
    window.safeJsonStringify = safeJsonStringify;
}

