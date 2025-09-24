<?php
/**
 * Serviço de Dashboard para Up.Baloes
 * 
 * Este arquivo gerencia os dados do dashboard do decorador,
 * incluindo KPIs e gráficos de estatísticas.
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
 * Classe para gerenciamento do dashboard
 */
class DashboardService {
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
     * Obter dados completos do dashboard
     */
    public function getDashboardData($filters = []) {
        try {
            $decoradorId = $_SESSION['user_id'] ?? 1;
            
            // Definir período padrão (mês atual)
            $dateFrom = $filters['date_from'] ?? date('Y-m-01');
            $dateTo = $filters['date_to'] ?? date('Y-m-t');
            
            // Obter KPIs
            $kpis = $this->getKPIs($decoradorId, $dateFrom, $dateTo);
            
            // Obter dados para gráficos
            $series = $this->getChartData($decoradorId, $dateFrom, $dateTo);
            
            return [
                'success' => true,
                'kpis' => $kpis,
                'series' => $series
            ];
            
        } catch (Exception $e) {
            error_log('Erro ao obter dados do dashboard: ' . $e->getMessage());
            return [
                'success' => false,
                'message' => 'Erro interno do servidor.'
            ];
        }
    }
    
    /**
     * Obter KPIs do dashboard
     */
    private function getKPIs($decoradorId, $dateFrom, $dateTo) {
        try {
            // Total de festas no período
            $stmt = $this->pdo->prepare("
                SELECT COUNT(*) as total
                FROM orcamentos 
                WHERE decorador_id = ? 
                AND data_evento BETWEEN ? AND ?
            ");
            $stmt->execute([$decoradorId, $dateFrom, $dateTo]);
            $festasTotal = $stmt->fetch()['total'];
            
            // Festas solicitadas por clientes (criadas via fluxo do cliente)
            $stmt = $this->pdo->prepare("
                SELECT COUNT(*) as total
                FROM orcamentos 
                WHERE decorador_id = ? 
                AND data_evento BETWEEN ? AND ?
                AND created_via = 'client'
            ");
            $stmt->execute([$decoradorId, $dateFrom, $dateTo]);
            $festasSolicitadasClientes = $stmt->fetch()['total'];
            
            // Festas criadas pelo decorador (inseridas pelo próprio decorador)
            $stmt = $this->pdo->prepare("
                SELECT COUNT(*) as total
                FROM orcamentos 
                WHERE decorador_id = ? 
                AND data_evento BETWEEN ? AND ?
                AND (created_via = 'decorator' OR created_via IS NULL)
            ");
            $stmt->execute([$decoradorId, $dateFrom, $dateTo]);
            $festasCriadasDecorador = $stmt->fetch()['total'];
            
            // Receita recebida (somente pagamentos confirmados)
            $stmt = $this->pdo->prepare("
                SELECT COALESCE(SUM(valor_estimado), 0) as total
                FROM orcamentos 
                WHERE decorador_id = ? 
                AND data_evento BETWEEN ? AND ?
                AND status = 'aprovado'
            ");
            $stmt->execute([$decoradorId, $dateFrom, $dateTo]);
            $receitaRecebida = $stmt->fetch()['total'];
            
            return [
                'festas_total' => (int) $festasTotal,
                'festas_solicitadas_clientes' => (int) $festasSolicitadasClientes,
                'festas_criadas_decorador' => (int) $festasCriadasDecorador,
                'receita_recebida' => (float) $receitaRecebida
            ];
            
        } catch (Exception $e) {
            error_log('Erro ao obter KPIs: ' . $e->getMessage());
            return [
                'festas_total' => 0,
                'festas_solicitadas_clientes' => 0,
                'festas_criadas_decorador' => 0,
                'receita_recebida' => 0.0
            ];
        }
    }
    
    /**
     * Obter dados para gráficos
     */
    private function getChartData($decoradorId, $dateFrom, $dateTo) {
        try {
            // Festas por mês (últimos 12 meses)
            $festasPorMes = $this->getFestasPorMes($decoradorId);
            
            // Festas por ano (últimos 5 anos)
            $festasPorAno = $this->getFestasPorAno($decoradorId);
            
            return [
                'festas_por_mes_12m' => $festasPorMes,
                'festas_por_ano_5a' => $festasPorAno
            ];
            
        } catch (Exception $e) {
            error_log('Erro ao obter dados dos gráficos: ' . $e->getMessage());
            return [
                'festas_por_mes_12m' => [],
                'festas_por_ano_5a' => []
            ];
        }
    }
    
    /**
     * Obter festas por mês (últimos 12 meses)
     */
    private function getFestasPorMes($decoradorId) {
        try {
            $stmt = $this->pdo->prepare("
                SELECT 
                    DATE_FORMAT(data_evento, '%Y-%m') as mes,
                    COUNT(*) as total
                FROM orcamentos 
                WHERE decorador_id = ? 
                AND data_evento >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
                GROUP BY DATE_FORMAT(data_evento, '%Y-%m')
                ORDER BY mes ASC
            ");
            $stmt->execute([$decoradorId]);
            $results = $stmt->fetchAll();
            
            // Criar array com todos os meses dos últimos 12 meses
            $months = [];
            for ($i = 11; $i >= 0; $i--) {
                $month = date('Y-m', strtotime("-{$i} months"));
                $months[] = [
                    'mes' => $month,
                    'total' => 0
                ];
            }
            
            // Preencher com dados reais
            foreach ($results as $result) {
                foreach ($months as &$month) {
                    if ($month['mes'] === $result['mes']) {
                        $month['total'] = (int) $result['total'];
                        break;
                    }
                }
            }
            
            return $months;
            
        } catch (Exception $e) {
            error_log('Erro ao obter festas por mês: ' . $e->getMessage());
            return [];
        }
    }
    
    /**
     * Obter festas por ano (últimos 5 anos)
     */
    private function getFestasPorAno($decoradorId) {
        try {
            $stmt = $this->pdo->prepare("
                SELECT 
                    YEAR(data_evento) as ano,
                    COUNT(*) as total
                FROM orcamentos 
                WHERE decorador_id = ? 
                AND data_evento >= DATE_SUB(CURDATE(), INTERVAL 5 YEAR)
                GROUP BY YEAR(data_evento)
                ORDER BY ano ASC
            ");
            $stmt->execute([$decoradorId]);
            $results = $stmt->fetchAll();
            
            // Criar array com todos os anos dos últimos 5 anos
            $years = [];
            for ($i = 4; $i >= 0; $i--) {
                $year = (int) date('Y', strtotime("-{$i} years"));
                $years[] = [
                    'ano' => $year,
                    'total' => 0
                ];
            }
            
            // Preencher com dados reais
            foreach ($results as $result) {
                foreach ($years as &$year) {
                    if ($year['ano'] === (int) $result['ano']) {
                        $year['total'] = (int) $result['total'];
                        break;
                    }
                }
            }
            
            return $years;
            
        } catch (Exception $e) {
            error_log('Erro ao obter festas por ano: ' . $e->getMessage());
            return [];
        }
    }
}

// Processar requisições
try {
    $dashboardService = new DashboardService($config);
    
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!$input) {
            throw new Exception('Dados inválidos.');
        }
        
        $action = $input['action'] ?? '';
        
        switch ($action) {
            case 'getData':
                $filters = [
                    'date_from' => $input['date_from'] ?? '',
                    'date_to' => $input['date_to'] ?? ''
                ];
                $result = $dashboardService->getDashboardData($filters);
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
?>
