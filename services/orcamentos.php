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
require_once 'config.php';

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
            // Validar dados específicos do tamanho do arco
            $arcSizeValidation = $this->validateArcSize($data);
            if (!$arcSizeValidation['success']) {
                return [
                    'success' => false,
                    'message' => $arcSizeValidation['message']
                ];
            }
            
            // Validar disponibilidade antes de criar o orçamento
            $availabilityCheck = $this->validateAvailability($data);
            if (!$availabilityCheck['success']) {
                return [
                    'success' => false,
                    'message' => $availabilityCheck['message']
                ];
            }
            
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
                $_SESSION['user_id'] ?? 1, // ID do decorador logado
                $data['created_via'] ?? 'decorator', // Origem da criação
                $data['image'] ?? null, // Caminho da imagem
                $data['tamanho_arco_m'] ?? null // Tamanho do arco
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
            return [
                'success' => false,
                'message' => 'Erro interno do servidor.'
            ];
        }
    }
    
    /**
     * Listar orçamentos
     */
    public function listBudgets($filters = []) {
        try {
            $where = ['decorador_id = ?'];
            $params = [$_SESSION['user_id'] ?? 1];
            
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
                'budgets' => $budgets
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
            // Para outros tipos de serviço, tamanho do arco deve estar vazio
            if (!empty($arcSize) && $arcSize !== '') {
                return [
                    'success' => false,
                    'message' => 'Tamanho do arco não é necessário para este tipo de serviço'
                ];
            }
        }
        
        return ['success' => true];
    }

    /**
     * Validar disponibilidade para um orçamento
     */
    private function validateAvailability($data) {
        try {
            $userId = $_SESSION['user_id'] ?? 1;
            $eventDate = $data['event_date'];
            $eventTime = $data['event_time'];
            $eventDateTime = $eventDate . ' ' . $eventTime;
            
            // Obter configurações de disponibilidade
            $stmt = $this->pdo->prepare("
                SELECT available_days, time_schedules, service_interval, interval_unit, max_daily_services 
                FROM decorator_availability 
                WHERE user_id = ? 
                ORDER BY updated_at DESC 
                LIMIT 1
            ");
            
            $stmt->execute([$userId]);
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$result) {
                // Se não há configurações, permitir criação (modo compatibilidade)
                return ['success' => true];
            }
            
            $availableDays = json_decode($result['available_days'], true);
            $timeSchedules = json_decode($result['time_schedules'], true);
            $serviceInterval = intval($result['service_interval']);
            $intervalUnit = $result['interval_unit'];
            $maxDailyServices = intval($result['max_daily_services']);
            
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
            
            if (!in_array($dayKey, $availableDays)) {
                return [
                    'success' => false,
                    'message' => 'Não há atendimento neste dia da semana'
                ];
            }
            
            // Verificar se o horário está dentro dos horários de atendimento
            $isWithinSchedule = false;
            foreach ($timeSchedules as $schedule) {
                if ($schedule['day'] === $dayKey) {
                    if ($eventTime >= $schedule['start_time'] && $eventTime <= $schedule['end_time']) {
                        $isWithinSchedule = true;
                        break;
                    }
                }
            }
            
            if (!$isWithinSchedule) {
                return [
                    'success' => false,
                    'message' => 'Horário fora do período de atendimento'
                ];
            }
            
            // Verificar limite de serviços por dia
            $stmt = $this->pdo->prepare("
                SELECT COUNT(*) as count 
                FROM orcamentos 
                WHERE decorador_id = ? 
                AND data_evento = ? 
                AND status IN ('aprovado', 'pendente')
            ");
            
            $stmt->execute([$userId, $eventDate]);
            $dailyCount = $stmt->fetch(PDO::FETCH_ASSOC)['count'];
            
            if ($dailyCount >= $maxDailyServices) {
                return [
                    'success' => false,
                    'message' => "Limite de {$maxDailyServices} serviços por dia atingido"
                ];
            }
            
            // Verificar intervalo entre serviços
            if ($serviceInterval > 0) {
                $intervalMinutes = $intervalUnit === 'hours' ? $serviceInterval * 60 : $serviceInterval;
                
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
                
                foreach ($existingTimes as $existingTime) {
                    $existingDateTime = new DateTime($eventDate . ' ' . $existingTime);
                    $newDateTime = new DateTime($eventDateTime);
                    
                    $diffMinutes = abs($newDateTime->getTimestamp() - $existingDateTime->getTimestamp()) / 60;
                    
                    if ($diffMinutes < $intervalMinutes) {
                        return [
                            'success' => false,
                            'message' => "Intervalo mínimo de {$serviceInterval} " . 
                                ($intervalUnit === 'hours' ? 'hora(s)' : 'minuto(s)') . 
                                " entre serviços não respeitado"
                        ];
                    }
                }
            }
            
            return ['success' => true];
            
        } catch (Exception $e) {
            error_log('Erro ao validar disponibilidade: ' . $e->getMessage());
            return [
                'success' => false,
                'message' => 'Erro ao validar disponibilidade'
            ];
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
    $budgetService = new BudgetService($config);
    
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!$input) {
            throw new Exception('Dados inválidos.');
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
        $budgetService = new BudgetService($config);
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