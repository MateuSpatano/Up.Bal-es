<?php
/**
 * Serviço de Gerenciamento de Disponibilidade
 * Up.Baloes - Sistema de Gestão de Decoração com Balões
 */

// Incluir configuração do banco de dados
require_once __DIR__ . '/config.php';

// Configurar cabeçalhos para JSON
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Verificar método da requisição
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
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

try {
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
            
        default:
            throw new Exception('Ação não reconhecida');
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
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
    
    // Validar intervalos por dia
    if (empty($data['service_intervals']) || !is_array($data['service_intervals'])) {
        throw new Exception('Intervalos entre serviços são obrigatórios');
    }
    
    foreach ($data['service_intervals'] as $interval) {
        if (empty($interval['day']) || !isset($interval['interval']) || empty($interval['unit'])) {
            throw new Exception('Todos os campos do intervalo são obrigatórios');
        }
        
        $intervalValue = intval($interval['interval']);
        if ($intervalValue < 0 || ($interval['unit'] === 'hours' && $intervalValue > 24) || ($interval['unit'] === 'minutes' && $intervalValue > 1440)) {
            throw new Exception('Intervalo entre serviços deve ser válido');
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
    
    if (!$result) {
        throw new Exception('Configurações de disponibilidade não encontradas');
    }
    
    $availableDays = json_decode($result['available_days'], true);
    $timeSchedules = json_decode($result['time_schedules'], true);
    $serviceIntervals = json_decode($result['service_intervals'], true);
    $maxDailyServices = intval($result['max_daily_services']);
    
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
        if ($schedule['day'] === $dayKey) {
            if ($eventTime >= $schedule['start_time'] && $eventTime <= $schedule['end_time']) {
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
        FROM budgets 
        WHERE user_id = ? 
        AND event_date = ? 
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
        if ($interval['day'] === $dayKey) {
            $dayInterval = $interval;
            break;
        }
    }
    
    if ($dayInterval && $dayInterval['interval'] > 0) {
        $intervalMinutes = $dayInterval['unit'] === 'hours' ? $dayInterval['interval'] * 60 : $dayInterval['interval'];
        
        $stmt = $pdo->prepare("
            SELECT event_time 
            FROM budgets 
            WHERE user_id = ? 
            AND event_date = ? 
            AND status IN ('aprovado', 'pendente')
            ORDER BY event_time
        ");
        
        $stmt->execute([$userId, $eventDate]);
        $existingTimes = $stmt->fetchAll(PDO::FETCH_COLUMN);
        
        foreach ($existingTimes as $existingTime) {
            $existingDateTime = new DateTime($eventDate . ' ' . $existingTime);
            $newDateTime = new DateTime($eventDateTime);
            
            $diffMinutes = abs($newDateTime->getTimestamp() - $existingDateTime->getTimestamp()) / 60;
            
            if ($diffMinutes < $intervalMinutes) {
                throw new Exception("Intervalo mínimo de {$dayInterval['interval']} " . 
                    ($dayInterval['unit'] === 'hours' ? 'hora(s)' : 'minuto(s)') . 
                    " entre serviços não respeitado para {$dayKey}");
            }
        }
    }
    
    echo json_encode([
        'success' => true,
        'message' => 'Horário disponível para agendamento',
        'available' => true
    ]);
}

/**
 * Verificar se uma data está bloqueada
 */
function checkIfDateIsBlocked($userId, $date) {
    global $pdo;
    
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
}

/**
 * Obter ID do usuário atual
 * Esta função deve ser implementada conforme seu sistema de autenticação
 */
function getCurrentUserId() {
    // Por enquanto, retornar um ID fixo para demonstração
    // Em produção, implementar autenticação adequada
    return 1;
}

/**
 * Criar tabela de disponibilidade se não existir
 */
function createAvailabilityTable() {
    global $pdo;
    
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
}

// Criar tabela se não existir
createAvailabilityTable();
?>