<?php
/**
 * Serviço de Gerenciamento de Disponibilidade
 * Up.Baloes - Sistema de Gestão de Decoração com Balões
 */

// Desabilitar exibição de erros para evitar HTML na resposta JSON
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);

// Configurar cabeçalhos para JSON ANTES de qualquer saída
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Verificar método da requisição
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

try {
    // Incluir configuração do banco de dados
    require_once __DIR__ . '/config.php';

    // Inicializar conexão com banco de dados
    $pdo = getDatabaseConnection($database_config);

    // Criar tabela se não existir (antes de qualquer operação)
    createAvailabilityTable();

    // Configurações de sessão
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }

    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405);
        echo json_encode(['success' => false, 'message' => 'Método não permitido']);
        exit();
    }

    // Obter dados da requisição
    $input = json_decode(file_get_contents('php://input'), true);

    if (!$input) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Dados inválidos']);
        exit();
    }

    $action = $input['action'] ?? '';

    switch ($action) {
        case 'save':
            saveAvailabilitySettings($input);
            break;
            
        case 'load':
            loadAvailabilitySettings();
            break;
            
        case 'validate':
            validateAvailability($input);
            break;
            
        case 'get_public_availability':
            getPublicAvailability($input);
            break;
            
        case 'get_available_dates':
            getAvailableDates($input);
            break;
            
        case 'get_available_times':
            getAvailableTimes($input);
            break;
            
        default:
            throw new Exception('Ação não reconhecida');
    }
} catch (Exception $e) {
    http_response_code(500);
    $errorMessage = $e->getMessage();
    error_log('Erro em disponibilidade.php: ' . $errorMessage . ' | Trace: ' . $e->getTraceAsString());
    echo json_encode([
        'success' => false,
        'message' => $errorMessage
    ]);
} catch (Error $e) {
    http_response_code(500);
    $errorMessage = 'Erro fatal: ' . $e->getMessage();
    error_log('Erro fatal em disponibilidade.php: ' . $errorMessage . ' | Arquivo: ' . $e->getFile() . ' | Linha: ' . $e->getLine());
    echo json_encode([
        'success' => false,
        'message' => $errorMessage,
        'file' => $e->getFile(),
        'line' => $e->getLine()
    ]);
}

/**
 * Salvar configurações de disponibilidade
 */
function saveAvailabilitySettings($data) {
    global $pdo;
    
    // Validar dados obrigatórios
    if (empty($data['available_days']) || !is_array($data['available_days'])) {
        throw new Exception('Dias de disponibilidade são obrigatórios');
    }
    
    if (empty($data['time_schedules']) || !is_array($data['time_schedules'])) {
        throw new Exception('Horários de atendimento são obrigatórios');
    }
    
    // Validar horários
    foreach ($data['time_schedules'] as $schedule) {
        if (empty($schedule['day']) || empty($schedule['start_time']) || empty($schedule['end_time'])) {
            throw new Exception('Todos os campos do horário são obrigatórios');
        }
        
        if ($schedule['start_time'] >= $schedule['end_time']) {
            throw new Exception('Horário de início deve ser anterior ao horário de fim');
        }
    }
    
    // Validar intervalos por dia (permitir array vazio, mas se houver intervalos, validar)
    if (!isset($data['service_intervals']) || !is_array($data['service_intervals'])) {
        throw new Exception('Intervalos entre serviços devem ser um array');
    }
    
    // Se houver intervalos, validar cada um
    if (!empty($data['service_intervals'])) {
        foreach ($data['service_intervals'] as $index => $interval) {
            if (empty($interval['day']) || !isset($interval['interval']) || empty($interval['unit'])) {
                throw new Exception("Intervalo #{$index}: Todos os campos são obrigatórios (dia, intervalo e unidade)");
            }
            
            $intervalValue = intval($interval['interval']);
            if ($intervalValue < 0 || ($interval['unit'] === 'hours' && $intervalValue > 24) || ($interval['unit'] === 'minutes' && $intervalValue > 1440)) {
                throw new Exception("Intervalo #{$index}: Valor inválido (deve estar entre 0 e 24 horas ou 0 e 1440 minutos)");
            }
        }
    }
    
    $maxDailyServices = intval($data['max_daily_services'] ?? 3);
    if ($maxDailyServices < 1 || $maxDailyServices > 10) {
        throw new Exception('Máximo de serviços por dia deve estar entre 1 e 10');
    }
    
    // Iniciar transação
    $pdo->beginTransaction();
    
    try {
        // Obter ID do usuário (assumindo que existe uma sessão ativa)
        $userId = getCurrentUserId();
        
        // Deletar configurações existentes
        $stmt = $pdo->prepare("DELETE FROM decorator_availability WHERE user_id = ?");
        $stmt->execute([$userId]);
        
        // Inserir nova configuração
        $stmt = $pdo->prepare("
            INSERT INTO decorator_availability 
            (user_id, available_days, time_schedules, service_intervals, max_daily_services, created_at, updated_at) 
            VALUES (?, ?, ?, ?, ?, NOW(), NOW())
        ");
        
        $stmt->execute([
            $userId,
            json_encode($data['available_days']),
            json_encode($data['time_schedules']),
            json_encode($data['service_intervals']),
            $maxDailyServices
        ]);
        
        $pdo->commit();
        
        echo json_encode([
            'success' => true,
            'message' => 'Configurações de disponibilidade salvas com sucesso',
            'data' => [
                'available_days' => $data['available_days'],
                'time_schedules' => $data['time_schedules'],
                'service_intervals' => $data['service_intervals'],
                'max_daily_services' => $maxDailyServices
            ]
        ]);
        
    } catch (Exception $e) {
        $pdo->rollBack();
        throw $e;
    }
}

/**
 * Carregar configurações de disponibilidade
 */
function loadAvailabilitySettings() {
    global $pdo;
    
    $userId = getCurrentUserId();
    
    $stmt = $pdo->prepare("
        SELECT available_days, time_schedules, service_intervals, max_daily_services 
        FROM decorator_availability 
        WHERE user_id = ? 
        ORDER BY updated_at DESC 
        LIMIT 1
    ");
    
    $stmt->execute([$userId]);
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$result) {
        // Retornar configurações padrão se não houver configurações salvas
        echo json_encode([
            'success' => true,
            'data' => [
                'available_days' => ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
                'time_schedules' => [
                    [
                        'day' => 'monday',
                        'start_time' => '08:00',
                        'end_time' => '18:00'
                    ],
                    [
                        'day' => 'tuesday',
                        'start_time' => '08:00',
                        'end_time' => '18:00'
                    ],
                    [
                        'day' => 'wednesday',
                        'start_time' => '08:00',
                        'end_time' => '18:00'
                    ],
                    [
                        'day' => 'thursday',
                        'start_time' => '08:00',
                        'end_time' => '18:00'
                    ],
                    [
                        'day' => 'friday',
                        'start_time' => '08:00',
                        'end_time' => '18:00'
                    ]
                ],
                'service_intervals' => [
                    [
                        'day' => 'monday',
                        'interval' => 1,
                        'unit' => 'hours'
                    ],
                    [
                        'day' => 'tuesday',
                        'interval' => 1,
                        'unit' => 'hours'
                    ],
                    [
                        'day' => 'wednesday',
                        'interval' => 1,
                        'unit' => 'hours'
                    ],
                    [
                        'day' => 'thursday',
                        'interval' => 1,
                        'unit' => 'hours'
                    ],
                    [
                        'day' => 'friday',
                        'interval' => 1,
                        'unit' => 'hours'
                    ]
                ],
                'max_daily_services' => 3
            ]
        ]);
        return;
    }
    
    // Decodificar JSON
    $availableDays = json_decode($result['available_days'], true);
    $timeSchedules = json_decode($result['time_schedules'], true);
    $serviceIntervals = json_decode($result['service_intervals'], true);
    
    echo json_encode([
        'success' => true,
        'data' => [
            'available_days' => $availableDays ?: [],
            'time_schedules' => $timeSchedules ?: [],
            'service_intervals' => $serviceIntervals ?: [],
            'max_daily_services' => intval($result['max_daily_services'])
        ]
    ]);
}

/**
 * Validar disponibilidade para uma data/hora específica
 */
function validateAvailability($data) {
    global $pdo;
    
    try {
        if (empty($data['event_date']) || empty($data['event_time'])) {
            throw new Exception('Data e hora do evento são obrigatórias');
        }
        
        $userId = getCurrentUserId();
        $eventDate = $data['event_date'];
        $eventTime = $data['event_time'];
        $eventDateTime = $eventDate . ' ' . $eventTime;
        
        // Obter configurações de disponibilidade
        $stmt = $pdo->prepare("
            SELECT available_days, time_schedules, service_intervals, max_daily_services 
            FROM decorator_availability 
            WHERE user_id = ? 
            ORDER BY updated_at DESC 
            LIMIT 1
        ");
        
        $stmt->execute([$userId]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        
        // Se não houver configurações, usar valores padrão
        if (!$result) {
            $availableDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
            $timeSchedules = [
                ['day' => 'monday', 'start_time' => '08:00', 'end_time' => '18:00'],
                ['day' => 'tuesday', 'start_time' => '08:00', 'end_time' => '18:00'],
                ['day' => 'wednesday', 'start_time' => '08:00', 'end_time' => '18:00'],
                ['day' => 'thursday', 'start_time' => '08:00', 'end_time' => '18:00'],
                ['day' => 'friday', 'start_time' => '08:00', 'end_time' => '18:00']
            ];
            $serviceIntervals = [];
            $maxDailyServices = 3;
        } else {
            $availableDays = json_decode($result['available_days'], true);
            $timeSchedules = json_decode($result['time_schedules'], true);
            $serviceIntervals = json_decode($result['service_intervals'], true);
            $maxDailyServices = intval($result['max_daily_services']);
            
            // Garantir que são arrays válidos
            if (!is_array($availableDays)) $availableDays = [];
            if (!is_array($timeSchedules)) $timeSchedules = [];
            if (!is_array($serviceIntervals)) $serviceIntervals = [];
            if ($maxDailyServices < 1) $maxDailyServices = 3;
        }
    
        // Verificar se a data está bloqueada
        $isDateBlocked = checkIfDateIsBlocked($userId, $eventDate);
        if ($isDateBlocked) {
            throw new Exception('Esta data está bloqueada para atendimento');
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
            throw new Exception('Não há atendimento neste dia da semana');
        }
        
        // Verificar se o horário está dentro dos horários de atendimento
        $isWithinSchedule = false;
        foreach ($timeSchedules as $schedule) {
            if (isset($schedule['day']) && $schedule['day'] === $dayKey) {
                if (isset($schedule['start_time']) && isset($schedule['end_time']) &&
                    $eventTime >= $schedule['start_time'] && $eventTime <= $schedule['end_time']) {
                    $isWithinSchedule = true;
                    break;
                }
            }
        }
        
        if (!$isWithinSchedule) {
            throw new Exception('Horário fora do período de atendimento');
        }
        
        // Verificar limite de serviços por dia
        $stmt = $pdo->prepare("
            SELECT COUNT(*) as count 
            FROM orcamentos 
            WHERE decorador_id = ? 
            AND data_evento = ? 
            AND status IN ('aprovado', 'pendente')
        ");
        
        $stmt->execute([$userId, $eventDate]);
        $dailyCount = $stmt->fetch(PDO::FETCH_ASSOC)['count'];
        
        if ($dailyCount >= $maxDailyServices) {
            throw new Exception("Limite de {$maxDailyServices} serviços por dia atingido");
        }
        
        // Verificar intervalo entre serviços para o dia específico
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
            
            $stmt = $pdo->prepare("
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
                try {
                    $existingDateTime = new DateTime($eventDate . ' ' . $existingTime);
                    $newDateTime = new DateTime($eventDateTime);
                    
                    $diffMinutes = abs($newDateTime->getTimestamp() - $existingDateTime->getTimestamp()) / 60;
                    
                    if ($diffMinutes < $intervalMinutes) {
                        throw new Exception("Intervalo mínimo de {$dayInterval['interval']} " . 
                            (isset($dayInterval['unit']) && $dayInterval['unit'] === 'hours' ? 'hora(s)' : 'minuto(s)') . 
                            " entre serviços não respeitado para {$dayKey}");
                    }
                } catch (Exception $e) {
                    // Se houver erro ao processar data/hora, continuar
                    error_log('Erro ao processar intervalo: ' . $e->getMessage());
                }
            }
        }
        
        echo json_encode([
            'success' => true,
            'message' => 'Horário disponível para agendamento',
            'available' => true
        ]);
    } catch (PDOException $e) {
        error_log('Erro de banco de dados em validateAvailability: ' . $e->getMessage());
        throw new Exception('Erro ao acessar banco de dados: ' . $e->getMessage());
    } catch (Exception $e) {
        error_log('Erro em validateAvailability: ' . $e->getMessage() . ' | Trace: ' . $e->getTraceAsString());
        throw $e;
    } catch (Error $e) {
        error_log('Erro fatal em validateAvailability: ' . $e->getMessage() . ' | Arquivo: ' . $e->getFile() . ' | Linha: ' . $e->getLine());
        throw new Exception('Erro ao validar disponibilidade: ' . $e->getMessage());
    }
}

/**
 * Verificar se uma data está bloqueada
 */
function checkIfDateIsBlocked($userId, $date) {
    global $pdo;
    
    try {
        // Verificar se a tabela existe antes de consultar
        $stmt = $pdo->prepare("
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
    } catch (PDOException $e) {
        // Se a tabela não existir ou houver erro, retornar false (data não bloqueada)
        error_log('Erro ao verificar data bloqueada: ' . $e->getMessage());
        return false;
    }
}

/**
 * Obter ID do usuário atual
 */
function getCurrentUserId() {
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }
    
    if (isset($_SESSION['user_id'])) {
        return (int) $_SESSION['user_id'];
    }
    
    // Se não houver sessão, retornar erro
    throw new Exception('Usuário não autenticado');
}

/**
 * Criar tabela de disponibilidade se não existir
 */
function createAvailabilityTable() {
    global $pdo;
    
    try {
        $sql = "
            CREATE TABLE IF NOT EXISTS decorator_availability (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                available_days JSON NOT NULL,
                time_schedules JSON NOT NULL,
                service_intervals JSON NOT NULL,
                max_daily_services INT DEFAULT 3,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_user_id (user_id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        ";
        
        $pdo->exec($sql);
    } catch (PDOException $e) {
        // Log do erro mas não interrompe a execução
        error_log('Erro ao criar tabela decorator_availability: ' . $e->getMessage());
    }
}

/**
 * Obter disponibilidade pública de um decorador específico (para clientes)
 */
function getPublicAvailability($data) {
    global $pdo;
    
    $decoratorId = $data['decorator_id'] ?? null;
    if (!$decoratorId) {
        throw new Exception('ID do decorador é obrigatório');
    }
    
    // Buscar configurações de disponibilidade do decorador
    $stmt = $pdo->prepare("
        SELECT available_days, time_schedules, service_intervals, max_daily_services 
        FROM decorator_availability 
        WHERE user_id = ? 
        ORDER BY updated_at DESC 
        LIMIT 1
    ");
    
    $stmt->execute([$decoratorId]);
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$result) {
        // Retornar configurações padrão se não houver configurações
        echo json_encode([
            'success' => true,
            'data' => [
                'available_days' => ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
                'time_schedules' => [
                    ['day' => 'monday', 'start_time' => '08:00', 'end_time' => '18:00'],
                    ['day' => 'tuesday', 'start_time' => '08:00', 'end_time' => '18:00'],
                    ['day' => 'wednesday', 'start_time' => '08:00', 'end_time' => '18:00'],
                    ['day' => 'thursday', 'start_time' => '08:00', 'end_time' => '18:00'],
                    ['day' => 'friday', 'start_time' => '08:00', 'end_time' => '18:00']
                ],
                'service_intervals' => [],
                'max_daily_services' => 3
            ]
        ]);
        return;
    }
    
    $availableDays = json_decode($result['available_days'], true);
    $timeSchedules = json_decode($result['time_schedules'], true);
    $serviceIntervals = json_decode($result['service_intervals'], true);
    
    // Buscar datas bloqueadas
    $stmt = $pdo->prepare("
        SELECT blocked_date, is_recurring 
        FROM decorator_blocked_dates 
        WHERE user_id = ?
    ");
    $stmt->execute([$decoratorId]);
    $blockedDates = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Buscar orçamentos já agendados
    $stmt = $pdo->prepare("
        SELECT data_evento, hora_evento 
        FROM orcamentos 
        WHERE decorador_id = ? 
        AND status IN ('aprovado', 'pendente')
        AND data_evento >= CURDATE()
    ");
    $stmt->execute([$decoratorId]);
    $scheduledServices = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode([
        'success' => true,
        'data' => [
            'available_days' => $availableDays ?: [],
            'time_schedules' => $timeSchedules ?: [],
            'service_intervals' => $serviceIntervals ?: [],
            'max_daily_services' => intval($result['max_daily_services']),
            'blocked_dates' => $blockedDates ?: [],
            'scheduled_services' => $scheduledServices ?: []
        ]
    ]);
}

/**
 * Obter datas disponíveis para um decorador
 */
function getAvailableDates($data) {
    global $pdo;
    
    $decoratorId = $data['decorator_id'] ?? null;
    $startDate = $data['start_date'] ?? date('Y-m-d');
    $endDate = $data['end_date'] ?? date('Y-m-d', strtotime('+3 months'));
    
    if (!$decoratorId) {
        throw new Exception('ID do decorador é obrigatório');
    }
    
    // Buscar configurações de disponibilidade
    $stmt = $pdo->prepare("
        SELECT available_days, max_daily_services 
        FROM decorator_availability 
        WHERE user_id = ? 
        ORDER BY updated_at DESC 
        LIMIT 1
    ");
    $stmt->execute([$decoratorId]);
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    
    $availableDays = $result ? json_decode($result['available_days'], true) : ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
    $maxDailyServices = $result ? intval($result['max_daily_services']) : 3;
    
    // Buscar datas bloqueadas
    $stmt = $pdo->prepare("
        SELECT blocked_date, is_recurring 
        FROM decorator_blocked_dates 
        WHERE user_id = ?
    ");
    $stmt->execute([$decoratorId]);
    $blockedDates = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Buscar serviços agendados por data
    $stmt = $pdo->prepare("
        SELECT data_evento, COUNT(*) as count 
        FROM orcamentos 
        WHERE decorador_id = ? 
        AND status IN ('aprovado', 'pendente')
        AND data_evento >= ? AND data_evento <= ?
        GROUP BY data_evento
    ");
    $stmt->execute([$decoratorId, $startDate, $endDate]);
    $scheduledCounts = [];
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $scheduledCounts[$row['data_evento']] = intval($row['count']);
    }
    
    // Gerar lista de datas disponíveis
    $availableDates = [];
    $currentDate = new DateTime($startDate);
    $endDateTime = new DateTime($endDate);
    
    $dayMapping = [
        'Monday' => 'monday',
        'Tuesday' => 'tuesday',
        'Wednesday' => 'wednesday',
        'Thursday' => 'thursday',
        'Friday' => 'friday',
        'Saturday' => 'saturday',
        'Sunday' => 'sunday'
    ];
    
    while ($currentDate <= $endDateTime) {
        $dateStr = $currentDate->format('Y-m-d');
        $dayName = $currentDate->format('l');
        $dayKey = $dayMapping[$dayName] ?? strtolower($dayName);
        
        // Verificar se o dia da semana está disponível
        if (!in_array($dayKey, $availableDays)) {
            $currentDate->modify('+1 day');
            continue;
        }
        
        // Verificar se a data está bloqueada
        $isBlocked = false;
        foreach ($blockedDates as $blocked) {
            if ($blocked['is_recurring']) {
                $blockedDate = new DateTime($blocked['blocked_date']);
                if ($currentDate->format('m-d') === $blockedDate->format('m-d')) {
                    $isBlocked = true;
                    break;
                }
            } else {
                if ($dateStr === $blocked['blocked_date']) {
                    $isBlocked = true;
                    break;
                }
            }
        }
        
        if ($isBlocked) {
            $currentDate->modify('+1 day');
            continue;
        }
        
        // Verificar se atingiu o limite de serviços por dia
        $scheduledCount = $scheduledCounts[$dateStr] ?? 0;
        if ($scheduledCount >= $maxDailyServices) {
            $currentDate->modify('+1 day');
            continue;
        }
        
        $availableDates[] = $dateStr;
        $currentDate->modify('+1 day');
    }
    
    echo json_encode([
        'success' => true,
        'available_dates' => $availableDates
    ]);
}

/**
 * Obter horários disponíveis para uma data específica
 */
function getAvailableTimes($data) {
    global $pdo;
    
    $decoratorId = $data['decorator_id'] ?? null;
    $date = $data['date'] ?? null;
    
    if (!$decoratorId || !$date) {
        throw new Exception('ID do decorador e data são obrigatórios');
    }
    
    // Buscar configurações de disponibilidade
    $stmt = $pdo->prepare("
        SELECT time_schedules, service_intervals 
        FROM decorator_availability 
        WHERE user_id = ? 
        ORDER BY updated_at DESC 
        LIMIT 1
    ");
    $stmt->execute([$decoratorId]);
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$result) {
        // Horários padrão
        $timeSchedules = [
            ['day' => 'monday', 'start_time' => '08:00', 'end_time' => '18:00'],
            ['day' => 'tuesday', 'start_time' => '08:00', 'end_time' => '18:00'],
            ['day' => 'wednesday', 'start_time' => '08:00', 'end_time' => '18:00'],
            ['day' => 'thursday', 'start_time' => '08:00', 'end_time' => '18:00'],
            ['day' => 'friday', 'start_time' => '08:00', 'end_time' => '18:00']
        ];
        $serviceIntervals = [];
    } else {
        $timeSchedules = json_decode($result['time_schedules'], true) ?: [];
        $serviceIntervals = json_decode($result['service_intervals'], true) ?: [];
    }
    
    // Obter dia da semana
    $dayOfWeek = strtolower(date('l', strtotime($date)));
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
    
    // Encontrar horário do dia
    $daySchedule = null;
    foreach ($timeSchedules as $schedule) {
        if ($schedule['day'] === $dayKey) {
            $daySchedule = $schedule;
            break;
        }
    }
    
    if (!$daySchedule) {
        echo json_encode([
            'success' => true,
            'available_times' => []
        ]);
        return;
    }
    
    // Buscar serviços já agendados neste dia
    $stmt = $pdo->prepare("
        SELECT hora_evento 
        FROM orcamentos 
        WHERE decorador_id = ? 
        AND data_evento = ? 
        AND status IN ('aprovado', 'pendente')
        ORDER BY hora_evento
    ");
    $stmt->execute([$decoratorId, $date]);
    $scheduledTimes = $stmt->fetchAll(PDO::FETCH_COLUMN);
    
    // Obter intervalo mínimo
    $intervalMinutes = 60; // padrão 1 hora
    foreach ($serviceIntervals as $interval) {
        if ($interval['day'] === $dayKey) {
            $intervalMinutes = $interval['unit'] === 'hours' ? $interval['interval'] * 60 : $interval['interval'];
            break;
        }
    }
    
    // Gerar horários disponíveis
    $startTime = new DateTime($date . ' ' . $daySchedule['start_time']);
    $endTime = new DateTime($date . ' ' . $daySchedule['end_time']);
    $availableTimes = [];
    
    $currentTime = clone $startTime;
    while ($currentTime < $endTime) {
        $timeStr = $currentTime->format('H:i');
        $isAvailable = true;
        
        // Verificar se há conflito com serviços agendados
        foreach ($scheduledTimes as $scheduledTime) {
            $scheduledDateTime = new DateTime($date . ' ' . $scheduledTime);
            $diffMinutes = abs($currentTime->getTimestamp() - $scheduledDateTime->getTimestamp()) / 60;
            
            if ($diffMinutes < $intervalMinutes) {
                $isAvailable = false;
                break;
            }
        }
        
        if ($isAvailable) {
            $availableTimes[] = $timeStr;
        }
        
        $currentTime->modify('+' . $intervalMinutes . ' minutes');
    }
    
    echo json_encode([
        'success' => true,
        'available_times' => $availableTimes
    ]);
}

?>