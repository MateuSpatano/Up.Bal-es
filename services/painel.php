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
require_once __DIR__ . '/config.php';

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
            
            // Obter projetos concluídos para lançamento de custos
            $projetosConcluidos = $this->getProjetosConcluidosParaCustos($decoradorId);
            
            return [
                'success' => true,
                'kpis' => $kpis,
                'series' => $series,
                'projetos_concluidos' => $projetosConcluidos
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
            // Total de festas no período (apenas aprovadas/confirmadas)
            $stmt = $this->pdo->prepare("
                SELECT COUNT(*) as total
                FROM orcamentos 
                WHERE decorador_id = ? 
                AND status = 'aprovado'
                AND data_evento BETWEEN ? AND ?
            ");
            $stmt->execute([$decoradorId, $dateFrom, $dateTo]);
            $festasTotal = $stmt->fetch()['total'];
            
            // Festas solicitadas por clientes (criadas via fluxo do cliente) - apenas aprovadas
            $stmt = $this->pdo->prepare("
                SELECT COUNT(*) as total
                FROM orcamentos 
                WHERE decorador_id = ? 
                AND status = 'aprovado'
                AND data_evento BETWEEN ? AND ?
                AND created_via = 'client'
            ");
            $stmt->execute([$decoradorId, $dateFrom, $dateTo]);
            $festasSolicitadasClientes = $stmt->fetch()['total'];
            
            // Festas criadas pelo decorador (inseridas pelo próprio decorador) - apenas aprovadas
            $stmt = $this->pdo->prepare("
                SELECT COUNT(*) as total
                FROM orcamentos 
                WHERE decorador_id = ? 
                AND status = 'aprovado'
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
            
            // Lucro total do mês (projetos com custos lançados)
            $stmt = $this->pdo->prepare("
                SELECT COALESCE(SUM(pc.lucro_real_liquido), 0) as total
                FROM projeto_custos pc
                INNER JOIN orcamentos o ON pc.orcamento_id = o.id
                WHERE o.decorador_id = ? 
                AND o.data_evento BETWEEN ? AND ?
            ");
            $stmt->execute([$decoradorId, $dateFrom, $dateTo]);
            $lucroTotalMes = $stmt->fetch()['total'];
            
            // Margem média de lucro
            $stmt = $this->pdo->prepare("
                SELECT COALESCE(AVG(pc.margem_lucro_percentual), 0) as media
                FROM projeto_custos pc
                INNER JOIN orcamentos o ON pc.orcamento_id = o.id
                WHERE o.decorador_id = ? 
                AND o.data_evento BETWEEN ? AND ?
            ");
            $stmt->execute([$decoradorId, $dateFrom, $dateTo]);
            $margemMediaLucro = $stmt->fetch()['media'];
            
            return [
                'festas_total' => (int) $festasTotal,
                'festas_solicitadas_clientes' => (int) $festasSolicitadasClientes,
                'festas_criadas_decorador' => (int) $festasCriadasDecorador,
                'receita_recebida' => (float) $receitaRecebida,
                'lucro_total_mes' => (float) $lucroTotalMes,
                'margem_media_lucro' => (float) $margemMediaLucro
            ];
            
        } catch (Exception $e) {
            error_log('Erro ao obter KPIs: ' . $e->getMessage());
            return [
                'festas_total' => 0,
                'festas_solicitadas_clientes' => 0,
                'festas_criadas_decorador' => 0,
                'receita_recebida' => 0.0,
                'lucro_total_mes' => 0.0,
                'margem_media_lucro' => 0.0
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
            // Contar apenas orçamentos aprovados (confirmados) nos gráficos
            $stmt = $this->pdo->prepare("
                SELECT 
                    DATE_FORMAT(data_evento, '%Y-%m') as mes,
                    COUNT(*) as total
                FROM orcamentos 
                WHERE decorador_id = ? 
                AND status = 'aprovado'
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
            // Contar apenas orçamentos aprovados (confirmados) nos gráficos
            $stmt = $this->pdo->prepare("
                SELECT 
                    YEAR(data_evento) as ano,
                    COUNT(*) as total
                FROM orcamentos 
                WHERE decorador_id = ? 
                AND status = 'aprovado'
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
    
    /**
     * Obter projetos concluídos para lançamento de custos
     */
    private function getProjetosConcluidosParaCustos($decoradorId) {
        try {
            // Buscar apenas orçamentos aprovados (confirmados) para que o decorador possa inserir despesas
            // Incluir tanto os que já têm custos quanto os que não têm, para permitir adicionar despesas adicionais
            $stmt = $this->pdo->prepare("
                SELECT 
                    o.id,
                    o.cliente,
                    o.email,
                    o.data_evento,
                    o.tipo_servico,
                    o.valor_estimado,
                    o.local_evento,
                    o.descricao,
                    o.hora_evento,
                    CASE WHEN pc.id IS NOT NULL THEN 1 ELSE 0 END as custos_lancados,
                    COALESCE(pc.custo_total_materiais, 0) as custo_total_materiais,
                    COALESCE(pc.custo_total_mao_de_obra, 0) as custo_total_mao_de_obra,
                    COALESCE(pc.custos_diversos, 0) as custos_diversos
                FROM orcamentos o
                LEFT JOIN projeto_custos pc ON o.id = pc.orcamento_id
                WHERE o.decorador_id = ? 
                AND o.status = 'aprovado'
                ORDER BY o.data_evento DESC, o.hora_evento DESC
                LIMIT 50
            ");
            $stmt->execute([$decoradorId]);
            $results = $stmt->fetchAll();
            
            return $results;
            
        } catch (Exception $e) {
            error_log('Erro ao obter projetos concluídos: ' . $e->getMessage());
            return [];
        }
    }
    
    /**
     * Lançar custos de um projeto
     */
    public function lancarCustosProjeto($orcamentoId, $dadosCustos) {
        try {
            $decoradorId = $_SESSION['user_id'] ?? 1;
            
            // Verificar se o orçamento existe e pertence ao decorador
            $stmt = $this->pdo->prepare("
                SELECT id, valor_estimado, status
                FROM orcamentos 
                WHERE id = ? AND decorador_id = ? AND status = 'aprovado'
            ");
            $stmt->execute([$orcamentoId, $decoradorId]);
            $orcamento = $stmt->fetch();
            
            if (!$orcamento) {
                return [
                    'success' => false,
                    'message' => 'Orçamento não encontrado ou não está aprovado.'
                ];
            }
            
            // Verificar se já existem custos para este projeto
            $stmt = $this->pdo->prepare("
                SELECT id FROM projeto_custos WHERE orcamento_id = ?
            ");
            $stmt->execute([$orcamentoId]);
            $custosExistentes = $stmt->fetch();
            
            // Calcular valores derivados
            $custoTotalMateriais = (float) ($dadosCustos['custo_total_materiais'] ?? 0);
            $custoTotalMaoObra = (float) ($dadosCustos['custo_total_mao_de_obra'] ?? 0);
            $custosDiversos = (float) ($dadosCustos['custos_diversos'] ?? 0);
            $precoVenda = (float) $orcamento['valor_estimado'];
            
            // Calcular custo total do projeto
            $custoTotalProjeto = $custoTotalMateriais + $custoTotalMaoObra + $custosDiversos;
            
            // Calcular lucro real líquido
            $lucroRealLiquido = $precoVenda - $custoTotalProjeto;
            
            // Calcular margem de lucro percentual
            $margemLucroPercentual = $precoVenda > 0 ? (($lucroRealLiquido / $precoVenda) * 100) : 0;
            
            if ($custosExistentes) {
                // Atualizar custos existentes
                $stmt = $this->pdo->prepare("
                    UPDATE projeto_custos 
                    SET 
                        custo_total_materiais = ?,
                        custo_total_mao_de_obra = ?,
                        custos_diversos = ?,
                        custo_total_projeto = ?,
                        lucro_real_liquido = ?,
                        margem_lucro_percentual = ?,
                        observacoes = ?,
                        updated_at = NOW()
                    WHERE orcamento_id = ?
                ");
                $stmt->execute([
                    $custoTotalMateriais,
                    $custoTotalMaoObra,
                    $custosDiversos,
                    $custoTotalProjeto,
                    $lucroRealLiquido,
                    $margemLucroPercentual,
                    $dadosCustos['observacoes'] ?? '',
                    $orcamentoId
                ]);
                
                $message = 'Custos atualizados com sucesso!';
            } else {
                // Inserir novos custos
                $stmt = $this->pdo->prepare("
                    INSERT INTO projeto_custos (
                        orcamento_id, preco_venda, custo_total_materiais, 
                        custo_total_mao_de_obra, custos_diversos, 
                        custo_total_projeto, lucro_real_liquido, margem_lucro_percentual,
                        observacoes
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                ");
                $stmt->execute([
                    $orcamentoId,
                    $precoVenda,
                    $custoTotalMateriais,
                    $custoTotalMaoObra,
                    $custosDiversos,
                    $custoTotalProjeto,
                    $lucroRealLiquido,
                    $margemLucroPercentual,
                    $dadosCustos['observacoes'] ?? ''
                ]);
                
                $message = 'Custos lançados com sucesso!';
            }
            
            // Obter os dados atualizados do projeto
            $stmt = $this->pdo->prepare("
                SELECT 
                    pc.*,
                    o.cliente,
                    o.data_evento,
                    o.tipo_servico,
                    o.local_evento,
                    o.valor_estimado
                FROM projeto_custos pc
                INNER JOIN orcamentos o ON pc.orcamento_id = o.id
                WHERE pc.orcamento_id = ?
            ");
            $stmt->execute([$orcamentoId]);
            $projetoAtualizado = $stmt->fetch();
            
            return [
                'success' => true,
                'message' => $message,
                'projeto' => $projetoAtualizado
            ];
            
        } catch (Exception $e) {
            error_log('Erro ao lançar custos: ' . $e->getMessage());
            return [
                'success' => false,
                'message' => 'Erro interno do servidor.'
            ];
        }
    }
    
    /**
     * Obter detalhes de custos de um projeto
     */
    public function getDetalhesCustosProjeto($orcamentoId) {
        try {
            $decoradorId = $_SESSION['user_id'] ?? 1;
            
            // Buscar apenas orçamentos aprovados (confirmados) para permitir inserir despesas
            $stmt = $this->pdo->prepare("
                SELECT 
                    o.id,
                    o.cliente,
                    o.valor_estimado,
                    o.data_evento,
                    o.tipo_servico,
                    o.local_evento,
                    o.descricao,
                    o.hora_evento,
                    COALESCE(pc.custo_total_materiais, 0) as custo_total_materiais,
                    COALESCE(pc.custo_total_mao_de_obra, 0) as custo_total_mao_de_obra,
                    COALESCE(pc.custos_diversos, 0) as custos_diversos,
                    COALESCE(pc.custo_total_projeto, 0) as custo_total_projeto,
                    COALESCE(pc.lucro_real_liquido, 0) as lucro_real_liquido,
                    COALESCE(pc.margem_lucro_percentual, 0) as margem_lucro_percentual,
                    COALESCE(pc.observacoes, '') as observacoes,
                    pc.created_at,
                    pc.updated_at
                FROM orcamentos o
                LEFT JOIN projeto_custos pc ON o.id = pc.orcamento_id
                WHERE o.id = ? 
                AND o.decorador_id = ?
                AND o.status = 'aprovado'
            ");
            $stmt->execute([$orcamentoId, $decoradorId]);
            $projeto = $stmt->fetch();
            
            if (!$projeto) {
                return [
                    'success' => false,
                    'message' => 'Projeto não encontrado ou não está aprovado.'
                ];
            }
            
            return [
                'success' => true,
                'projeto' => $projeto
            ];
            
        } catch (Exception $e) {
            error_log('Erro ao obter detalhes do projeto: ' . $e->getMessage());
            return [
                'success' => false,
                'message' => 'Erro interno do servidor.'
            ];
        }
    }
}

// Processar requisições
try {
    $dashboardService = new DashboardService($database_config);
    
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
                
            case 'lancarCustos':
                $orcamentoId = $input['orcamento_id'] ?? null;
                $dadosCustos = $input['dados_custos'] ?? [];
                
                if (!$orcamentoId || empty($dadosCustos)) {
                    throw new Exception('Dados insuficientes para lançamento de custos.');
                }
                
                $result = $dashboardService->lancarCustosProjeto($orcamentoId, $dadosCustos);
                break;
                
            case 'getDetalhesCustos':
                $orcamentoId = $input['orcamento_id'] ?? null;
                
                if (!$orcamentoId) {
                    throw new Exception('ID do orçamento é obrigatório.');
                }
                
                $result = $dashboardService->getDetalhesCustosProjeto($orcamentoId);
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
