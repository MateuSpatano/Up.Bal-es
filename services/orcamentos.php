<?php
/**
 * Serviço de Gerenciamento de Orçamentos para Up.Baloes
 * 
 * Este arquivo gerencia todas as operações relacionadas aos orçamentos
 * do sistema de decoração com balões.
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

// Configurações de sessão
session_start();

// Incluir configuração do banco de dados
require_once __DIR__ . '/config.php';

/**
 * Classe para gerenciamento de orçamentos
 */
class BudgetService {
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
     * Criar novo orçamento
     */
    public function createBudget($data) {
        try {
            // Validar campos obrigatórios
            $requiredFields = ['client', 'email', 'event_date', 'event_time', 'event_location', 'service_type'];
            foreach ($requiredFields as $field) {
                if (empty($data[$field])) {
                    return [
                        'success' => false,
                        'message' => "Campo obrigatório não preenchido: {$field}"
                    ];
                }
            }
            
            // Validar dados específicos do tamanho do arco
            $arcSizeValidation = $this->validateArcSize($data);
            if (!$arcSizeValidation['success']) {
                return [
                    'success' => false,
                    'message' => $arcSizeValidation['message']
                ];
            }
            
            // Determinar decorador_id ANTES de validar disponibilidade
            $decoradorId = null;
            if (isset($data['decorador_id']) && $data['decorador_id']) {
                // Decorador_id fornecido explicitamente (do carrinho)
                $decoradorId = (int)$data['decorador_id'];
            } elseif (isset($_SESSION['user_id']) && $_SESSION['user_role'] === 'decorator') {
                // Decorador criando seu próprio orçamento
                $decoradorId = $_SESSION['user_id'];
            } else {
                // Buscar primeiro decorador ativo como padrão
                $stmtDefault = $this->pdo->prepare("SELECT id FROM usuarios WHERE perfil = 'decorator' AND ativo = 1 AND aprovado_por_admin = 1 LIMIT 1");
                $stmtDefault->execute();
                $defaultDecorator = $stmtDefault->fetch();
                $decoradorId = $defaultDecorator ? (int)$defaultDecorator['id'] : 1;
            }
            
            // Validar disponibilidade antes de criar o orçamento (passando o decorador_id correto)
            $availabilityCheck = $this->validateAvailability($data, $decoradorId);
            if (!$availabilityCheck['success']) {
                return [
                    'success' => false,
                    'message' => $availabilityCheck['message']
                ];
            }
            
            // Processar upload de imagem se houver
            $imagePath = null;
            // Verificar diferentes nomes possíveis para o campo de imagem
            $imageFieldName = null;
            if (isset($_FILES['inspiration_image']) && $_FILES['inspiration_image']['error'] === UPLOAD_ERR_OK) {
                $imageFieldName = 'inspiration_image';
            } elseif (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
                $imageFieldName = 'image';
            }
            
            if ($imageFieldName) {
                $imageUpload = $this->handleImageUpload($_FILES[$imageFieldName]);
                if (!$imageUpload['success']) {
                    return [
                        'success' => false,
                        'message' => $imageUpload['message']
                    ];
                }
                $imagePath = $imageUpload['path'];
            }
            
            // Processar tamanho do arco - apenas para tipos que requerem
            $arcServiceTypes = ['arco-tradicional', 'arco-desconstruido'];
            $tamanhoArco = null;
            if (in_array($data['service_type'], $arcServiceTypes)) {
                $tamanhoArco = !empty($data['tamanho_arco_m']) ? floatval($data['tamanho_arco_m']) : null;
            }
            // Para outros tipos, sempre NULL (ignorar se preenchido)
            
            $stmt = $this->pdo->prepare("
                INSERT INTO orcamentos (
                    cliente, email, telefone, data_evento, hora_evento, 
                    local_evento, tipo_servico, descricao, valor_estimado, 
                    observacoes, status, decorador_id, created_via, imagem, tamanho_arco_m, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
            ");
            
            $stmt->execute([
                $data['client'],
                $data['email'],
                $data['phone'] ?? null,
                $data['event_date'],
                $data['event_time'],
                $data['event_location'],
                $data['service_type'],
                $data['description'] ?? null,
                $data['estimated_value'] ?? 0,
                $data['notes'] ?? null,
                'pendente',
                $decoradorId,
                $data['created_via'] ?? 'decorator', // Origem da criação
                $imagePath, // Caminho da imagem
                $tamanhoArco // Tamanho do arco (NULL se não for tipo de arco)
            ]);
            
            $budgetId = $this->pdo->lastInsertId();
            
            // Log da ação
            $this->logAction('create_budget', $budgetId);
            
            return [
                'success' => true,
                'message' => 'Orçamento criado com sucesso!',
                'budget_id' => $budgetId
            ];
            
        } catch (Exception $e) {
            error_log('Erro ao criar orçamento: ' . $e->getMessage());
            error_log('Stack trace: ' . $e->getTraceAsString());
            error_log('Dados recebidos: ' . print_r($data, true));
            return [
                'success' => false,
                'message' => 'Erro ao criar orçamento: ' . $e->getMessage()
            ];
        }
    }
    
    /**
     * Listar orçamentos
     */
    public function listBudgets($filters = []) {
        try {
            // Obter ID do decorador da sessão
            $decoradorId = $_SESSION['user_id'] ?? null;
            
            // Se não houver user_id na sessão, tentar obter do role
            if (!$decoradorId && isset($_SESSION['user_role']) && $_SESSION['user_role'] === 'decorator') {
                // Tentar buscar o ID do decorador logado de outra forma
                $decoradorId = $_SESSION['user_id'] ?? null;
            }
            
            // Se ainda não houver, usar 1 como fallback (apenas para debug)
            if (!$decoradorId) {
                $decoradorId = 1;
                error_log('listBudgets: Usando decorador_id padrão (1) - sessão não contém user_id');
            }
            
            error_log('listBudgets: Buscando orçamentos para decorador_id: ' . $decoradorId);
            error_log('listBudgets: Sessão user_id: ' . ($_SESSION['user_id'] ?? 'não definido'));
            error_log('listBudgets: Sessão user_role: ' . ($_SESSION['user_role'] ?? 'não definido'));
            
            // Buscar orçamentos do decorador logado
            // Se não houver user_id na sessão (decorador_id = 1 por padrão), 
            // buscar também orçamentos sem decorador_id para compatibilidade
            if (!isset($_SESSION['user_id']) || $_SESSION['user_id'] == null) {
                // Se não há sessão válida, buscar todos os orçamentos (modo compatibilidade)
                $where = ['(decorador_id = ? OR decorador_id IS NULL OR decorador_id = 0)'];
                $params = [$decoradorId];
            } else {
                // Buscar apenas orçamentos do decorador logado
                $where = ['decorador_id = ?'];
                $params = [$decoradorId];
            }
            
            // Filtros
            if (!empty($filters['status'])) {
                $where[] = 'status = ?';
                $params[] = $filters['status'];
            }
            
            if (!empty($filters['client'])) {
                $where[] = 'cliente LIKE ?';
                $params[] = '%' . $filters['client'] . '%';
            }
            
            if (!empty($filters['period'])) {
                switch ($filters['period']) {
                    case 'hoje':
                        $where[] = 'DATE(data_evento) = CURDATE()';
                        break;
                    case 'semana':
                        $where[] = 'data_evento BETWEEN DATE_SUB(NOW(), INTERVAL 7 DAY) AND NOW()';
                        break;
                    case 'mes':
                        $where[] = 'MONTH(data_evento) = MONTH(NOW()) AND YEAR(data_evento) = YEAR(NOW())';
                        break;
                }
            }
            
            $sql = "
                SELECT 
                    id, cliente, email, telefone, data_evento, hora_evento,
                    local_evento, tipo_servico, descricao, valor_estimado,
                    observacoes, status, imagem, tamanho_arco_m, created_at, updated_at, decorador_id
                FROM orcamentos 
                WHERE " . implode(' AND ', $where) . "
                ORDER BY created_at DESC
            ";
            
            error_log('listBudgets: SQL: ' . $sql);
            error_log('listBudgets: Params: ' . json_encode($params));
            
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute($params);
            $budgets = $stmt->fetchAll();
            
            error_log('listBudgets: Encontrados ' . count($budgets) . ' orçamento(s)');
            
            // Formatar dados
            foreach ($budgets as &$budget) {
                $budget['event_date'] = $budget['data_evento'];
                $budget['event_time'] = $budget['hora_evento'];
                $budget['event_location'] = $budget['local_evento'];
                $budget['service_type'] = $budget['tipo_servico'];
                $budget['estimated_value'] = (float) $budget['valor_estimado'];
                $budget['client'] = $budget['cliente'];
                $budget['phone'] = $budget['telefone'];
                $budget['description'] = $budget['descricao'];
                $budget['notes'] = $budget['observacoes'];
                $budget['image'] = $budget['imagem'];
                $budget['tamanho_arco_m'] = $budget['tamanho_arco_m'] ? (float) $budget['tamanho_arco_m'] : null;
                $budget['created_at'] = $budget['created_at'];
                $budget['decorador_id'] = $budget['decorador_id'] ?? $decoradorId;
            }
            
            error_log('listBudgets: Retornando ' . count($budgets) . ' orçamento(s) formatado(s)');
            
            return [
                'success' => true,
                'budgets' => $budgets,
                'count' => count($budgets),
                'decorador_id' => $decoradorId // Para debug
            ];
            
        } catch (Exception $e) {
            error_log('Erro ao listar orçamentos: ' . $e->getMessage());
            return [
                'success' => false,
                'message' => 'Erro interno do servidor.'
            ];
        }
    }
    
    /**
     * Obter orçamento por ID
     */
    public function getBudget($id) {
        try {
            $stmt = $this->pdo->prepare("
                SELECT 
                    id, cliente, email, telefone, data_evento, hora_evento,
                    local_evento, tipo_servico, descricao, valor_estimado,
                    observacoes, status, imagem, tamanho_arco_m, created_at, updated_at
                FROM orcamentos 
                WHERE id = ? AND decorador_id = ?
            ");
            
            $stmt->execute([$id, $_SESSION['user_id'] ?? 1]);
            $budget = $stmt->fetch();
            
            if (!$budget) {
                return [
                    'success' => false,
                    'message' => 'Orçamento não encontrado.'
                ];
            }
            
            // Formatar dados
            $budget['event_date'] = $budget['data_evento'];
            $budget['event_time'] = $budget['hora_evento'];
            $budget['event_location'] = $budget['local_evento'];
            $budget['service_type'] = $budget['tipo_servico'];
            $budget['estimated_value'] = (float) $budget['valor_estimado'];
            $budget['client'] = $budget['cliente'];
            $budget['phone'] = $budget['telefone'];
            $budget['description'] = $budget['descricao'];
            $budget['notes'] = $budget['observacoes'];
            $budget['tamanho_arco_m'] = $budget['tamanho_arco_m'] ? (float) $budget['tamanho_arco_m'] : null;
            
            return [
                'success' => true,
                'budget' => $budget
            ];
            
        } catch (Exception $e) {
            error_log('Erro ao obter orçamento: ' . $e->getMessage());
            return [
                'success' => false,
                'message' => 'Erro interno do servidor.'
            ];
        }
    }
    
    /**
     * Atualizar orçamento
     */
    public function updateBudget($id, $data) {
        try {
            $fields = [];
            $params = [];
            
            $allowedFields = [
                'client' => 'cliente',
                'email' => 'email',
                'phone' => 'telefone',
                'event_date' => 'data_evento',
                'event_time' => 'hora_evento',
                'event_location' => 'local_evento',
                'service_type' => 'tipo_servico',
                'description' => 'descricao',
                'estimated_value' => 'valor_estimado',
                'notes' => 'observacoes',
                'tamanho_arco_m' => 'tamanho_arco_m'
            ];
            
            foreach ($allowedFields as $key => $column) {
                if (isset($data[$key])) {
                    $fields[] = "$column = ?";
                    $params[] = $data[$key];
                }
            }
            
            if (empty($fields)) {
                return [
                    'success' => false,
                    'message' => 'Nenhum campo para atualizar.'
                ];
            }
            
            $fields[] = 'updated_at = NOW()';
            $params[] = $id;
            $params[] = $_SESSION['user_id'] ?? 1;
            
            $sql = "
                UPDATE orcamentos 
                SET " . implode(', ', $fields) . "
                WHERE id = ? AND decorador_id = ?
            ";
            
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute($params);
            
            if ($stmt->rowCount() === 0) {
                return [
                    'success' => false,
                    'message' => 'Orçamento não encontrado.'
                ];
            }
            
            // Log da ação
            $this->logAction('update_budget', $id);
            
            return [
                'success' => true,
                'message' => 'Orçamento atualizado com sucesso!'
            ];
            
        } catch (Exception $e) {
            error_log('Erro ao atualizar orçamento: ' . $e->getMessage());
            return [
                'success' => false,
                'message' => 'Erro interno do servidor.'
            ];
        }
    }
    
    /**
     * Aprovar orçamento
     */
    public function approveBudget($id) {
        try {
            $stmt = $this->pdo->prepare("
                UPDATE orcamentos 
                SET status = 'aprovado', updated_at = NOW()
                WHERE id = ? AND decorador_id = ?
            ");
            
            $stmt->execute([$id, $_SESSION['user_id'] ?? 1]);
            
            if ($stmt->rowCount() === 0) {
                return [
                    'success' => false,
                    'message' => 'Orçamento não encontrado.'
                ];
            }
            
            // Log da ação
            $this->logAction('approve_budget', $id);
            
            return [
                'success' => true,
                'message' => 'Orçamento aprovado com sucesso!'
            ];
            
        } catch (Exception $e) {
            error_log('Erro ao aprovar orçamento: ' . $e->getMessage());
            return [
                'success' => false,
                'message' => 'Erro interno do servidor.'
            ];
        }
    }
    
    /**
     * Recusar orçamento
     */
    public function rejectBudget($id) {
        try {
            $stmt = $this->pdo->prepare("
                UPDATE orcamentos 
                SET status = 'recusado', updated_at = NOW()
                WHERE id = ? AND decorador_id = ?
            ");
            
            $stmt->execute([$id, $_SESSION['user_id'] ?? 1]);
            
            if ($stmt->rowCount() === 0) {
                return [
                    'success' => false,
                    'message' => 'Orçamento não encontrado.'
                ];
            }
            
            // Log da ação
            $this->logAction('reject_budget', $id);
            
            return [
                'success' => true,
                'message' => 'Orçamento recusado.'
            ];
            
        } catch (Exception $e) {
            error_log('Erro ao recusar orçamento: ' . $e->getMessage());
            return [
                'success' => false,
                'message' => 'Erro interno do servidor.'
            ];
        }
    }
    
    /**
     * Alterar status do orçamento
     */
    public function changeStatus($id, $status) {
        try {
            // Validar status
            $allowedStatuses = ['pendente', 'aprovado', 'recusado', 'cancelado', 'enviado'];
            if (!in_array($status, $allowedStatuses)) {
                return [
                    'success' => false,
                    'message' => 'Status inválido.'
                ];
            }
            
            $stmt = $this->pdo->prepare("
                UPDATE orcamentos 
                SET status = ?, updated_at = NOW()
                WHERE id = ? AND decorador_id = ?
            ");
            
            $stmt->execute([$status, $id, $_SESSION['user_id'] ?? 1]);
            
            if ($stmt->rowCount() === 0) {
                return [
                    'success' => false,
                    'message' => 'Orçamento não encontrado.'
                ];
            }
            
            // Log da ação
            $this->logAction('change_status', $id, ['new_status' => $status]);
            
            $statusLabels = [
                'pendente' => 'Pendente',
                'aprovado' => 'Aprovado',
                'recusado' => 'Recusado',
                'cancelado' => 'Cancelado',
                'enviado' => 'Enviado'
            ];
            
            return [
                'success' => true,
                'message' => "Status alterado para '{$statusLabels[$status]}' com sucesso!"
            ];
            
        } catch (Exception $e) {
            error_log('Erro ao alterar status do orçamento: ' . $e->getMessage());
            return [
                'success' => false,
                'message' => 'Erro interno do servidor.'
            ];
        }
    }

    /**
     * Listar orçamentos de um cliente específico
     */
    public function listClientBudgets($email, $status = '') {
        try {
            $where = ['email = ?'];
            $params = [$email];
            
            if (!empty($status)) {
                $where[] = 'status = ?';
                $params[] = $status;
            }
            
            $sql = "
                SELECT 
                    id, cliente, email, telefone, data_evento, hora_evento,
                    local_evento, tipo_servico, descricao, valor_estimado,
                    observacoes, status, imagem, tamanho_arco_m, created_at, updated_at
                FROM orcamentos 
                WHERE " . implode(' AND ', $where) . "
                ORDER BY created_at DESC
            ";
            
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute($params);
            $budgets = $stmt->fetchAll();
            
            // Formatar dados
            foreach ($budgets as &$budget) {
                $budget['event_date'] = $budget['data_evento'];
                $budget['event_time'] = $budget['hora_evento'];
                $budget['event_location'] = $budget['local_evento'];
                $budget['service_type'] = $budget['tipo_servico'];
                $budget['estimated_value'] = (float) $budget['valor_estimado'];
                $budget['client'] = $budget['cliente'];
                $budget['phone'] = $budget['telefone'];
                $budget['description'] = $budget['descricao'];
                $budget['notes'] = $budget['observacoes'];
                $budget['image'] = $budget['imagem'];
                $budget['tamanho_arco_m'] = $budget['tamanho_arco_m'] ? (float) $budget['tamanho_arco_m'] : null;
                $budget['created_at'] = $budget['created_at'];
            }
            
            return [
                'success' => true,
                'requests' => $budgets
            ];
            
        } catch (Exception $e) {
            error_log('Erro ao listar orçamentos do cliente: ' . $e->getMessage());
            return [
                'success' => false,
                'message' => 'Erro interno do servidor.'
            ];
        }
    }
    
    /**
     * Obter orçamento de um cliente por ID
     */
    public function getClientBudget($id) {
        try {
            $stmt = $this->pdo->prepare("
                SELECT 
                    id, cliente, email, telefone, data_evento, hora_evento,
                    local_evento, tipo_servico, descricao, valor_estimado,
                    observacoes, status, imagem, tamanho_arco_m, created_at, updated_at
                FROM orcamentos 
                WHERE id = ?
            ");
            
            $stmt->execute([$id]);
            $budget = $stmt->fetch();
            
            if (!$budget) {
                return [
                    'success' => false,
                    'message' => 'Solicitação não encontrada.'
                ];
            }
            
            // Formatar dados
            $budget['event_date'] = $budget['data_evento'];
            $budget['event_time'] = $budget['hora_evento'];
            $budget['event_location'] = $budget['local_evento'];
            $budget['service_type'] = $budget['tipo_servico'];
            $budget['estimated_value'] = (float) $budget['valor_estimado'];
            $budget['client'] = $budget['cliente'];
            $budget['phone'] = $budget['telefone'];
            $budget['description'] = $budget['descricao'];
            $budget['notes'] = $budget['observacoes'];
            $budget['tamanho_arco_m'] = $budget['tamanho_arco_m'] ? (float) $budget['tamanho_arco_m'] : null;
            
            return [
                'success' => true,
                'request' => $budget,
                'budget' => $budget // Compatibilidade
            ];
            
        } catch (Exception $e) {
            error_log('Erro ao obter orçamento do cliente: ' . $e->getMessage());
            return [
                'success' => false,
                'message' => 'Erro interno do servidor.'
            ];
        }
    }
    
    /**
     * Deletar orçamento
     */
    public function deleteBudget($id) {
        try {
            $stmt = $this->pdo->prepare("
                DELETE FROM orcamentos 
                WHERE id = ? AND decorador_id = ?
            ");
            
            $stmt->execute([$id, $_SESSION['user_id'] ?? 1]);
            
            if ($stmt->rowCount() === 0) {
                return [
                    'success' => false,
                    'message' => 'Orçamento não encontrado.'
                ];
            }
            
            // Log da ação
            $this->logAction('delete_budget', $id);
            
            return [
                'success' => true,
                'message' => 'Orçamento deletado com sucesso!'
            ];
            
        } catch (Exception $e) {
            error_log('Erro ao deletar orçamento: ' . $e->getMessage());
            return [
                'success' => false,
                'message' => 'Erro interno do servidor.'
            ];
        }
    }
    
    /**
     * Obter estatísticas dos orçamentos
     */
    public function getStats() {
        try {
            $decoradorId = $_SESSION['user_id'] ?? 1;
            
            $stmt = $this->pdo->prepare("
                SELECT 
                    COUNT(*) as total,
                    SUM(CASE WHEN status = 'pendente' THEN 1 ELSE 0 END) as pendentes,
                    SUM(CASE WHEN status = 'aprovado' THEN 1 ELSE 0 END) as aprovados,
                    SUM(CASE WHEN status = 'recusado' THEN 1 ELSE 0 END) as recusados,
                    SUM(CASE WHEN status = 'enviado' THEN 1 ELSE 0 END) as enviados,
                    SUM(CASE WHEN status = 'aprovado' THEN valor_estimado ELSE 0 END) as receita_total
                FROM orcamentos 
                WHERE decorador_id = ?
            ");
            
            $stmt->execute([$decoradorId]);
            $stats = $stmt->fetch();
            
            return [
                'success' => true,
                'stats' => $stats
            ];
            
        } catch (Exception $e) {
            error_log('Erro ao obter estatísticas: ' . $e->getMessage());
            return [
                'success' => false,
                'message' => 'Erro interno do servidor.'
            ];
        }
    }
    
    /**
     * Obter orçamentos recentes para notificações
     */
    public function getRecentBudgets($limit = 10) {
        try {
            $decoradorId = $_SESSION['user_id'] ?? 1;
            
            $stmt = $this->pdo->prepare("
                SELECT 
                    id, cliente, email, telefone, data_evento, hora_evento,
                    local_evento, tipo_servico, descricao, valor_estimado,
                    observacoes, status, tamanho_arco_m, created_at, updated_at
                FROM orcamentos 
                WHERE decorador_id = ?
                ORDER BY created_at DESC
                LIMIT ?
            ");
            
            $stmt->execute([$decoradorId, $limit]);
            $budgets = $stmt->fetchAll();
            
            // Formatar dados
            foreach ($budgets as &$budget) {
                $budget['event_date'] = $budget['data_evento'];
                $budget['event_time'] = $budget['hora_evento'];
                $budget['event_location'] = $budget['local_evento'];
                $budget['service_type'] = $budget['tipo_servico'];
                $budget['estimated_value'] = (float) $budget['valor_estimado'];
                $budget['client'] = $budget['cliente'];
                $budget['phone'] = $budget['telefone'];
                $budget['description'] = $budget['descricao'];
                $budget['notes'] = $budget['observacoes'];
                $budget['tamanho_arco_m'] = $budget['tamanho_arco_m'] ? (float) $budget['tamanho_arco_m'] : null;
                $budget['created_at'] = $budget['created_at'];
                
                // Formatar data para exibição
                $budget['formatted_date'] = date('d/m/Y H:i', strtotime($budget['created_at']));
                $budget['time_ago'] = $this->getTimeAgo($budget['created_at']);
            }
            
            return [
                'success' => true,
                'budgets' => $budgets,
                'count' => count($budgets)
            ];
            
        } catch (Exception $e) {
            error_log('Erro ao obter orçamentos recentes: ' . $e->getMessage());
            return [
                'success' => false,
                'message' => 'Erro interno do servidor.'
            ];
        }
    }
    
    /**
     * Buscar clientes por nome
     */
    public function searchClients($name) {
        try {
            if (empty($name) || strlen($name) < 2) {
                return [
                    'success' => true,
                    'clients' => []
                ];
            }
            
            // Buscar clientes (usuários com perfil 'user') por nome
            $stmt = $this->pdo->prepare("
                SELECT id, nome, email, telefone 
                FROM usuarios 
                WHERE perfil = 'user' 
                AND ativo = 1 
                AND nome LIKE ? 
                ORDER BY nome ASC 
                LIMIT 10
            ");
            
            $searchTerm = '%' . $name . '%';
            $stmt->execute([$searchTerm]);
            $clients = $stmt->fetchAll();
            
            return [
                'success' => true,
                'clients' => $clients
            ];
            
        } catch (Exception $e) {
            error_log('Erro ao buscar clientes: ' . $e->getMessage());
            return [
                'success' => false,
                'message' => 'Erro ao buscar clientes.'
            ];
        }
    }
    
    /**
     * Calcular tempo decorrido
     */
    private function getTimeAgo($datetime) {
        $time = time() - strtotime($datetime);
        
        if ($time < 60) return 'agora mesmo';
        if ($time < 3600) return floor($time/60) . ' min atrás';
        if ($time < 86400) return floor($time/3600) . ' h atrás';
        if ($time < 2592000) return floor($time/86400) . ' dias atrás';
        if ($time < 31536000) return floor($time/2592000) . ' meses atrás';
        return floor($time/31536000) . ' anos atrás';
    }
    
    /**
     * Log de ações
     */
    /**
     * Validar tamanho do arco
     */
    private function validateArcSize($data) {
        $serviceType = $data['service_type'] ?? '';
        $arcSize = $data['tamanho_arco_m'] ?? null;
        
        // Verificar se é um tipo de serviço que requer tamanho do arco
        $arcServiceTypes = ['arco-tradicional', 'arco-desconstruido'];
        
        if (in_array($serviceType, $arcServiceTypes)) {
            // Tamanho do arco é obrigatório para estes tipos
            if (empty($arcSize) || $arcSize === '') {
                return [
                    'success' => false,
                    'message' => 'Tamanho do arco é obrigatório para este tipo de serviço'
                ];
            }
            
            // Validar se é um número válido
            $arcSizeFloat = floatval($arcSize);
            if ($arcSizeFloat <= 0) {
                return [
                    'success' => false,
                    'message' => 'Tamanho do arco deve ser um número positivo'
                ];
            }
            
            // Validar faixa permitida (0.5 a 30 metros)
            if ($arcSizeFloat < 0.5 || $arcSizeFloat > 30) {
                return [
                    'success' => false,
                    'message' => 'Tamanho do arco deve estar entre 0.5 e 30 metros'
                ];
            }
            
            // Validar precisão (máximo 1 casa decimal)
            if (round($arcSizeFloat, 1) != $arcSizeFloat) {
                return [
                    'success' => false,
                    'message' => 'Tamanho do arco deve ter no máximo 1 casa decimal'
                ];
            }
        } else {
            // Para outros tipos de serviço, tamanho do arco é opcional
            // Se estiver preenchido, simplesmente ignorar (não bloquear)
            // Isso permite que o campo seja sempre visível sem causar problemas
        }
        
        return ['success' => true];
    }

    /**
     * Validar disponibilidade para um orçamento
     */
    private function validateAvailability($data, $decoradorId = null) {
        try {
            // Usar o decorador_id passado como parâmetro, ou tentar da sessão, ou usar padrão
            if ($decoradorId !== null) {
                $userId = $decoradorId;
            } elseif (isset($_SESSION['user_id']) && $_SESSION['user_role'] === 'decorator') {
                $userId = $_SESSION['user_id'];
            } else {
                $userId = 1; // Fallback apenas se não houver outra opção
            }
            
            $eventDate = $data['event_date'];
            $eventTime = $data['event_time'];
            $eventDateTime = $eventDate . ' ' . $eventTime;
            
            // Obter configurações de disponibilidade
            $stmt = $this->pdo->prepare("
                SELECT available_days, time_schedules, service_intervals, max_daily_services 
                FROM decorator_availability 
                WHERE user_id = ? 
                ORDER BY updated_at DESC 
                LIMIT 1
            ");
            
            $stmt->execute([$userId]);
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            
            // Se não há configurações, usar valores padrão permissivos
            if (!$result) {
                $availableDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
                $timeSchedules = [
                    ['day' => 'monday', 'start_time' => '08:00', 'end_time' => '18:00'],
                    ['day' => 'tuesday', 'start_time' => '08:00', 'end_time' => '18:00'],
                    ['day' => 'wednesday', 'start_time' => '08:00', 'end_time' => '18:00'],
                    ['day' => 'thursday', 'start_time' => '08:00', 'end_time' => '18:00'],
                    ['day' => 'friday', 'start_time' => '08:00', 'end_time' => '18:00']
                ];
                $serviceIntervals = [];
                $maxDailyServices = 10; // Limite alto por padrão
            } else {
                $availableDays = json_decode($result['available_days'], true);
                $timeSchedules = json_decode($result['time_schedules'], true);
                $serviceIntervals = json_decode($result['service_intervals'], true);
                $maxDailyServices = intval($result['max_daily_services']);
                
                // Garantir que são arrays válidos
                if (!is_array($availableDays)) $availableDays = [];
                if (!is_array($timeSchedules)) $timeSchedules = [];
                if (!is_array($serviceIntervals)) $serviceIntervals = [];
                if ($maxDailyServices < 1) $maxDailyServices = 10;
            }
            
            // Verificar se a data está bloqueada
            $isDateBlocked = $this->checkIfDateIsBlocked($userId, $eventDate);
            if ($isDateBlocked) {
                return [
                    'success' => false,
                    'message' => 'Esta data está bloqueada para atendimento'
                ];
            }
            
            // Verificar se o dia da semana está disponível
            $dayOfWeek = strtolower(date('l', strtotime($eventDate)));
            $dayMapping = [
                'monday' => 'monday',
                'tuesday' => 'tuesday', 
                'wednesday' => 'wednesday',
                'thursday' => 'thursday',
                'friday' => 'friday',
                'saturday' => 'saturday',
                'sunday' => 'sunday'
            ];
            
            $dayKey = $dayMapping[$dayOfWeek] ?? $dayOfWeek;
            
            // Se não houver dias disponíveis configurados, permitir qualquer dia
            if (empty($availableDays) || !is_array($availableDays)) {
                // Permitir qualquer dia se não houver configuração
            } else if (!in_array($dayKey, $availableDays)) {
                return [
                    'success' => false,
                    'message' => 'Não há atendimento neste dia da semana (' . $dayKey . ')'
                ];
            }
            
            // Verificar se o horário está dentro dos horários de atendimento
            $isWithinSchedule = false;
            if (!empty($timeSchedules) && is_array($timeSchedules)) {
                foreach ($timeSchedules as $schedule) {
                    if (isset($schedule['day']) && $schedule['day'] === $dayKey) {
                        if (isset($schedule['start_time']) && isset($schedule['end_time']) &&
                            $eventTime >= $schedule['start_time'] && $eventTime <= $schedule['end_time']) {
                            $isWithinSchedule = true;
                            break;
                        }
                    }
                }
            } else {
                // Se não houver horários configurados, permitir qualquer horário
                $isWithinSchedule = true;
            }
            
            if (!$isWithinSchedule) {
                return [
                    'success' => false,
                    'message' => 'Horário fora do período de atendimento'
                ];
            }
            
            // Verificar limite de serviços por dia
            try {
                $stmt = $this->pdo->prepare("
                    SELECT COUNT(*) as count 
                    FROM orcamentos 
                    WHERE decorador_id = ? 
                    AND data_evento = ? 
                    AND status IN ('aprovado', 'pendente')
                ");
                
                $stmt->execute([$userId, $eventDate]);
                $countResult = $stmt->fetch(PDO::FETCH_ASSOC);
                $dailyCount = $countResult ? intval($countResult['count']) : 0;
                
                if ($dailyCount >= $maxDailyServices) {
                    return [
                        'success' => false,
                        'message' => "Limite de {$maxDailyServices} serviços por dia atingido"
                    ];
                }
            } catch (PDOException $e) {
                // Se houver erro, assumir que não há limite atingido
                error_log('Erro ao verificar limite de serviços: ' . $e->getMessage());
            }
            
            // Verificar intervalo entre serviços para o dia específico
            if (!empty($serviceIntervals) && is_array($serviceIntervals)) {
                $dayInterval = null;
                foreach ($serviceIntervals as $interval) {
                    if (isset($interval['day']) && $interval['day'] === $dayKey) {
                        $dayInterval = $interval;
                        break;
                    }
                }
                
                if ($dayInterval && isset($dayInterval['interval']) && $dayInterval['interval'] > 0) {
                    $intervalMinutes = (isset($dayInterval['unit']) && $dayInterval['unit'] === 'hours') 
                        ? $dayInterval['interval'] * 60 
                        : $dayInterval['interval'];
                    
                    try {
                        $stmt = $this->pdo->prepare("
                            SELECT hora_evento 
                            FROM orcamentos 
                            WHERE decorador_id = ? 
                            AND data_evento = ? 
                            AND status IN ('aprovado', 'pendente')
                            ORDER BY hora_evento
                        ");
                        
                        $stmt->execute([$userId, $eventDate]);
                        $existingTimes = $stmt->fetchAll(PDO::FETCH_COLUMN);
                        
                        if (is_array($existingTimes)) {
                            foreach ($existingTimes as $existingTime) {
                                if (empty($existingTime)) continue;
                                
                                try {
                                    $existingDateTime = new DateTime($eventDate . ' ' . $existingTime);
                                    $newDateTime = new DateTime($eventDateTime);
                                    
                                    $diffMinutes = abs($newDateTime->getTimestamp() - $existingDateTime->getTimestamp()) / 60;
                                    
                                    if ($diffMinutes < $intervalMinutes) {
                                        return [
                                            'success' => false,
                                            'message' => "Intervalo mínimo de {$dayInterval['interval']} " . 
                                                (isset($dayInterval['unit']) && $dayInterval['unit'] === 'hours' ? 'hora(s)' : 'minuto(s)') . 
                                                " entre serviços não respeitado para {$dayKey}"
                                        ];
                                    }
                                } catch (Exception $e) {
                                    // Continuar se houver erro ao processar data/hora
                                    error_log('Erro ao processar intervalo: ' . $e->getMessage());
                                }
                            }
                        }
                    } catch (PDOException $e) {
                        // Se houver erro, não bloquear por intervalo
                        error_log('Erro ao verificar intervalo entre serviços: ' . $e->getMessage());
                    }
                }
            }
            
            return ['success' => true];
            
        } catch (PDOException $e) {
            error_log('Erro de banco de dados ao validar disponibilidade: ' . $e->getMessage() . ' | SQL State: ' . $e->getCode());
            // Em caso de erro de banco, permitir criação (modo compatibilidade)
            return ['success' => true];
        } catch (Exception $e) {
            error_log('Erro ao validar disponibilidade: ' . $e->getMessage() . ' | Trace: ' . $e->getTraceAsString());
            // Em caso de erro geral, permitir criação (modo compatibilidade)
            return ['success' => true];
        } catch (Error $e) {
            error_log('Erro fatal ao validar disponibilidade: ' . $e->getMessage() . ' | Arquivo: ' . $e->getFile() . ' | Linha: ' . $e->getLine());
            // Em caso de erro fatal, permitir criação (modo compatibilidade)
            return ['success' => true];
        }
    }

    /**
     * Verificar se uma data está bloqueada
     */
    private function checkIfDateIsBlocked($userId, $date) {
        try {
            $stmt = $this->pdo->prepare("
                SELECT id, reason, is_recurring
                FROM decorator_blocked_dates 
                WHERE user_id = ? 
                AND (
                    blocked_date = ? 
                    OR (is_recurring = 1 AND DATE_FORMAT(blocked_date, '%m-%d') = DATE_FORMAT(?, '%m-%d'))
                )
            ");
            
            $stmt->execute([$userId, $date, $date]);
            return $stmt->fetch() !== false;
        } catch (Exception $e) {
            error_log('Erro ao verificar data bloqueada: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Processar upload de imagem
     */
    private function handleImageUpload($file) {
        try {
            // Verificar se o arquivo foi enviado corretamente
            if ($file['error'] !== UPLOAD_ERR_OK) {
                return [
                    'success' => false,
                    'message' => 'Erro no upload do arquivo'
                ];
            }
            
            // Validar tipo de arquivo
            $allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
            if (!in_array($file['type'], $allowedTypes)) {
                return [
                    'success' => false,
                    'message' => 'Tipo de arquivo não permitido. Use apenas JPG, PNG, GIF ou WebP'
                ];
            }
            
            // Validar tamanho do arquivo (máximo 5MB)
            $maxSize = 5 * 1024 * 1024; // 5MB
            if ($file['size'] > $maxSize) {
                return [
                    'success' => false,
                    'message' => 'Arquivo muito grande. Tamanho máximo: 5MB'
                ];
            }
            
            // Criar diretório de uploads se não existir
            $uploadDir = '../uploads/inspiration_images/';
            if (!is_dir($uploadDir)) {
                mkdir($uploadDir, 0755, true);
            }
            
            // Gerar nome único para o arquivo
            $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
            $fileName = uniqid('inspiration_', true) . '.' . $extension;
            $filePath = $uploadDir . $fileName;
            
            // Mover arquivo para o diretório de destino
            if (move_uploaded_file($file['tmp_name'], $filePath)) {
                return [
                    'success' => true,
                    'path' => 'uploads/inspiration_images/' . $fileName
                ];
            } else {
                return [
                    'success' => false,
                    'message' => 'Erro ao salvar arquivo'
                ];
            }
            
        } catch (Exception $e) {
            error_log('Erro no upload de imagem: ' . $e->getMessage());
            return [
                'success' => false,
                'message' => 'Erro interno no upload'
            ];
        }
    }

    /**
     * Enviar orçamento por e-mail
     */
    public function sendBudgetByEmail($budgetId, $customMessage = '') {
        try {
            // Obter dados do orçamento
            $budget = $this->getBudget($budgetId);
            if (!$budget['success']) {
                return $budget;
            }
            
            $budgetData = $budget['budget'];
            
            // Gerar link para visualização do orçamento
            $budgetUrl = $this->generateBudgetUrl($budgetId);
            
            // Preparar dados do e-mail
            $to = $budgetData['email'];
            $subject = "Seu Orçamento de Decoração com Balões - Up.Baloes";
            
            // Template do e-mail
            $message = $this->generateEmailTemplate($budgetData, $budgetUrl, $customMessage);
            
            // Headers do e-mail
            $headers = [
                'MIME-Version: 1.0',
                'Content-type: text/html; charset=UTF-8',
                'From: Up.Baloes <noreply@upbaloes.com>',
                'Reply-To: Up.Baloes <contato@upbaloes.com>',
                'X-Mailer: PHP/' . phpversion()
            ];
            
            // Enviar e-mail
            $mailSent = mail($to, $subject, $message, implode("\r\n", $headers));
            
            if ($mailSent) {
                // Log da ação
                $this->logAction('send_email', $budgetId);
                
                return [
                    'success' => true,
                    'message' => 'E-mail enviado com sucesso!'
                ];
            } else {
                return [
                    'success' => false,
                    'message' => 'Erro ao enviar e-mail. Tente novamente.'
                ];
            }
            
        } catch (Exception $e) {
            error_log('Erro ao enviar e-mail: ' . $e->getMessage());
            return [
                'success' => false,
                'message' => 'Erro interno do servidor.'
            ];
        }
    }
    
    /**
     * Gerar URL para visualização do orçamento
     */
    private function generateBudgetUrl($budgetId) {
        $protocol = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? 'https' : 'http';
        $host = $_SERVER['HTTP_HOST'];
        $basePath = dirname($_SERVER['REQUEST_URI']);
        $basePath = str_replace('/services', '', $basePath);
        
        return "{$protocol}://{$host}{$basePath}/pages/painel-decorador.html?view=budget&id={$budgetId}";
    }
    
    /**
     * Gerar template do e-mail
     */
    private function generateEmailTemplate($budget, $budgetUrl, $customMessage = '') {
        $serviceTypeLabels = [
            'arco-tradicional' => 'Arco Tradicional',
            'arco-desconstruido' => 'Arco Desconstruído',
            'escultura-balao' => 'Escultura de Balão',
            'centro-mesa' => 'Centro de Mesa',
            'baloes-piscina' => 'Balões na Piscina'
        ];
        
        $serviceType = $serviceTypeLabels[$budget['service_type']] ?? $budget['service_type'];
        
        $html = '
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Seu Orçamento - Up.Baloes</title>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
                .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
                .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
                .header h1 { margin: 0; font-size: 28px; }
                .header p { margin: 10px 0 0 0; opacity: 0.9; }
                .content { padding: 30px; }
                .budget-info { background: #f8f9fa; border-radius: 8px; padding: 20px; margin: 20px 0; }
                .budget-info h3 { color: #495057; margin-top: 0; }
                .info-row { display: flex; justify-content: space-between; margin: 10px 0; padding: 8px 0; border-bottom: 1px solid #e9ecef; }
                .info-label { font-weight: bold; color: #6c757d; }
                .info-value { color: #495057; }
                .cta-button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; margin: 20px 0; }
                .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #6c757d; font-size: 14px; }
                .custom-message { background: #e3f2fd; border-left: 4px solid #2196f3; padding: 15px; margin: 20px 0; border-radius: 4px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🎈 Up.Baloes</h1>
                    <p>Seu orçamento de decoração com balões está pronto!</p>
                </div>
                
                <div class="content">
                    <h2>Olá, ' . htmlspecialchars($budget['client']) . '!</h2>
                    
                    <p>Obrigado por escolher a Up.Baloes para sua decoração especial! Seu orçamento foi preparado com muito carinho e está pronto para sua análise.</p>';
        
        if (!empty($customMessage)) {
            $html .= '
                    <div class="custom-message">
                        <strong>Mensagem personalizada:</strong><br>
                        ' . nl2br(htmlspecialchars($customMessage)) . '
                    </div>';
        }
        
        $html .= '
                    <div class="budget-info">
                        <h3>📋 Detalhes do Seu Orçamento</h3>
                        <div class="info-row">
                            <span class="info-label">Serviço:</span>
                            <span class="info-value">' . htmlspecialchars($serviceType) . '</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Data do Evento:</span>
                            <span class="info-value">' . date('d/m/Y', strtotime($budget['event_date'])) . ' às ' . $budget['event_time'] . '</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Local:</span>
                            <span class="info-value">' . htmlspecialchars($budget['event_location']) . '</span>
                        </div>';
        
        if ($budget['tamanho_arco_m']) {
            $html .= '
                        <div class="info-row">
                            <span class="info-label">Tamanho do Arco:</span>
                            <span class="info-value">' . $budget['tamanho_arco_m'] . ' metros</span>
                        </div>';
        }
        
        if ($budget['estimated_value'] > 0) {
            $html .= '
                        <div class="info-row">
                            <span class="info-label">Valor Estimado:</span>
                            <span class="info-value">R$ ' . number_format($budget['estimated_value'], 2, ',', '.') . '</span>
                        </div>';
        }
        
        $html .= '
                    </div>
                    
                    <div style="text-align: center;">
                        <a href="' . $budgetUrl . '" class="cta-button">Ver Orçamento Completo</a>
                    </div>
                    
                    <p>Clique no botão acima para visualizar todos os detalhes do seu orçamento, incluindo imagens de inspiração e informações adicionais.</p>
                    
                    <p>Se você tiver alguma dúvida ou desejar fazer alterações, não hesite em entrar em contato conosco!</p>
                    
                    <p>Estamos ansiosos para tornar seu evento ainda mais especial! 🎉</p>
                </div>
                
                <div class="footer">
                    <p><strong>Up.Baloes</strong> - Decoração com Balões</p>
                    <p>📧 contato@upbaloes.com | 📱 (11) 99999-9999</p>
                </div>
            </div>
        </body>
        </html>';
        
        return $html;
    }

    private function logAction($action, $budgetId) {
        try {
            $stmt = $this->pdo->prepare("
                INSERT INTO budget_logs (budget_id, action, user_id, ip_address, user_agent, created_at) 
                VALUES (?, ?, ?, ?, ?, NOW())
            ");
            
            $stmt->execute([
                $budgetId,
                $action,
                $_SESSION['user_id'] ?? 1,
                $_SERVER['REMOTE_ADDR'] ?? 'unknown',
                $_SERVER['HTTP_USER_AGENT'] ?? 'unknown'
            ]);
        } catch (Exception $e) {
            error_log('Erro ao salvar log: ' . $e->getMessage());
        }
    }
}

// Processar requisições
try {
    $budgetService = new BudgetService($database_config);
    
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        // Verificar se é FormData (upload de arquivo) ou JSON
        $contentType = $_SERVER['CONTENT_TYPE'] ?? '';
        
        // Verificar se há arquivos enviados ou se é multipart/form-data
        if (!empty($_FILES) || strpos($contentType, 'multipart/form-data') !== false) {
            // Processar FormData
            $input = $_POST;
            $input['action'] = $_POST['action'] ?? '';
            
            // Log para debug
            error_log('FormData recebido: ' . print_r($input, true));
        } else {
            // Processar JSON
            $input = json_decode(file_get_contents('php://input'), true);
            
            if (!$input) {
                throw new Exception('Dados inválidos.');
            }
        }
        
        $action = $input['action'] ?? '';
        
        switch ($action) {
            case 'create':
                $result = $budgetService->createBudget($input);
                break;
                
            case 'list':
                $filters = [
                    'status' => $input['status'] ?? '',
                    'client' => $input['client'] ?? '',
                    'period' => $input['period'] ?? ''
                ];
                $result = $budgetService->listBudgets($filters);
                break;
                
            case 'get':
                $id = $input['id'] ?? '';
                if (empty($id)) {
                    throw new Exception('ID do orçamento é obrigatório.');
                }
                $result = $budgetService->getBudget($id);
                break;
                
            case 'update':
                $id = $input['id'] ?? '';
                if (empty($id)) {
                    throw new Exception('ID do orçamento é obrigatório.');
                }
                unset($input['action'], $input['id']);
                $result = $budgetService->updateBudget($id, $input);
                break;
                
            case 'approve':
                $id = $input['id'] ?? '';
                if (empty($id)) {
                    throw new Exception('ID do orçamento é obrigatório.');
                }
                $result = $budgetService->approveBudget($id);
                break;
                
            case 'reject':
                $id = $input['id'] ?? '';
                if (empty($id)) {
                    throw new Exception('ID do orçamento é obrigatório.');
                }
                $result = $budgetService->rejectBudget($id);
                break;
                
            case 'changeStatus':
                $id = $input['id'] ?? '';
                $status = $input['status'] ?? '';
                if (empty($id) || empty($status)) {
                    throw new Exception('ID do orçamento e status são obrigatórios.');
                }
                $result = $budgetService->changeStatus($id, $status);
                break;
                
            case 'delete':
                $id = $input['id'] ?? '';
                if (empty($id)) {
                    throw new Exception('ID do orçamento é obrigatório.');
                }
                $result = $budgetService->deleteBudget($id);
                break;
                
            case 'stats':
                $result = $budgetService->getStats();
                break;
                
            case 'send_email':
                $budgetId = $input['budget_id'] ?? '';
                $customMessage = $input['custom_message'] ?? '';
                if (empty($budgetId)) {
                    throw new Exception('ID do orçamento é obrigatório.');
                }
                $result = $budgetService->sendBudgetByEmail($budgetId, $customMessage);
                break;
                
            case 'list_client':
                $email = $input['email'] ?? '';
                $status = $input['status'] ?? '';
                if (empty($email)) {
                    throw new Exception('Email do cliente é obrigatório.');
                }
                $result = $budgetService->listClientBudgets($email, $status);
                break;
                
            case 'get_client':
                $id = $input['id'] ?? '';
                if (empty($id)) {
                    throw new Exception('ID do orçamento é obrigatório.');
                }
                $result = $budgetService->getClientBudget($id);
                break;
                
            case 'search_clients':
                $name = $input['name'] ?? '';
                $result = $budgetService->searchClients($name);
                break;
                
            default:
                throw new Exception('Ação não reconhecida.');
        }
        
        echo json_encode($result);
        
    } else {
        throw new Exception('Método não permitido.');
    }
    
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}

/**
 * Endpoint para buscar orçamentos recentes para notificações
 */
if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['action']) && $_GET['action'] === 'recent') {
    try {
        $budgetService = new BudgetService($database_config);
        $recentBudgets = $budgetService->getRecentBudgets();
        echo json_encode($recentBudgets);
        exit;
    } catch (Exception $e) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => $e->getMessage()
        ]);
        exit;
    }
}

/**
 * ESTRUTURA DO BANCO DE DADOS (SQL para criação das tabelas)
 * 
 * CREATE TABLE orcamentos (
 *     id INT AUTO_INCREMENT PRIMARY KEY,
 *     cliente VARCHAR(100) NOT NULL,
 *     email VARCHAR(100) NOT NULL,
 *     telefone VARCHAR(20),
 *     data_evento DATE NOT NULL,
 *     hora_evento TIME NOT NULL,
 *     local_evento VARCHAR(255) NOT NULL,
 *     tipo_servico ENUM('arco-tradicional', 'arco-desconstruido', 'escultura-balao', 'centro-mesa', 'baloes-piscina') NOT NULL,
 *     descricao TEXT,
 *     valor_estimado DECIMAL(10,2) DEFAULT 0,
 *     observacoes TEXT,
 *     status ENUM('pendente', 'aprovado', 'recusado', 'cancelado', 'enviado') DEFAULT 'pendente',
 *     decorador_id INT NOT NULL,
 *     created_via ENUM('client', 'decorator') DEFAULT 'decorator',
 *     imagem VARCHAR(255),
 *     tamanho_arco_m DECIMAL(4,1),
 *     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 *     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
 *     FOREIGN KEY (decorador_id) REFERENCES usuarios(id) ON DELETE CASCADE
 * );
 * 
 * CREATE TABLE budget_logs (
 *     id INT AUTO_INCREMENT PRIMARY KEY,
 *     budget_id INT NOT NULL,
 *     action VARCHAR(50) NOT NULL,
 *     user_id INT,
 *     ip_address VARCHAR(45),
 *     user_agent TEXT,
 *     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 *     FOREIGN KEY (budget_id) REFERENCES orcamentos(id) ON DELETE CASCADE,
 *     FOREIGN KEY (user_id) REFERENCES usuarios(id) ON DELETE SET NULL
 * );
 */
?>