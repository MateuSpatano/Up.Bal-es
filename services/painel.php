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
            // Obter decorador_id da sessão, similar ao painel gerencial
            $decoradorId = $_SESSION['user_id'] ?? null;
            
            // Se não houver user_id na sessão, tentar obter do role
            if (!$decoradorId && isset($_SESSION['user_role']) && $_SESSION['user_role'] === 'decorator') {
                $decoradorId = $_SESSION['user_id'] ?? null;
            }
            
            // Se ainda não houver, usar 1 como fallback (apenas para debug)
            if (!$decoradorId) {
                $decoradorId = 1;
                error_log('getDashboardData: Usando decorador_id padrão (1) - sessão não contém user_id');
            }
            
            // Log para debug
            error_log('getDashboardData: Decorador ID da sessão = ' . ($_SESSION['user_id'] ?? 'não definido'));
            error_log('getDashboardData: Decorador ID usado = ' . $decoradorId);
            error_log('getDashboardData: Sessão user_role = ' . ($_SESSION['user_role'] ?? 'não definido'));
            
            // Verificar se há orçamentos aprovados antes de buscar
            $stmtCheck = $this->pdo->prepare("
                SELECT COUNT(*) as total_aprovados
                FROM orcamentos 
                WHERE decorador_id = ? 
                AND status = 'aprovado'
            ");
            $stmtCheck->execute([$decoradorId]);
            $checkResult = $stmtCheck->fetch();
            error_log('getDashboardData: Total de orçamentos aprovados encontrados: ' . ($checkResult['total_aprovados'] ?? 0));
            
            // Definir período padrão (mês atual)
            $dateFrom = $filters['date_from'] ?? date('Y-m-01');
            $dateTo = $filters['date_to'] ?? date('Y-m-t');
            
            error_log('getDashboardData: Período - De: ' . $dateFrom . ' Até: ' . $dateTo);
            
            // Obter KPIs
            $kpis = $this->getKPIs($decoradorId, $dateFrom, $dateTo);
            error_log('getDashboardData: KPIs obtidos - Total: ' . ($kpis['festas_total'] ?? 0));
            
            // Obter dados para gráficos
            $series = $this->getChartData($decoradorId, $dateFrom, $dateTo);
            
            // Obter projetos concluídos para lançamento de custos
            $projetosConcluidos = $this->getProjetosConcluidosParaCustos($decoradorId);
            
            // Log para debug
            error_log('getDashboardData: Retornando ' . count($projetosConcluidos) . ' projeto(s) concluído(s)');
            
            return [
                'success' => true,
                'kpis' => $kpis,
                'series' => $series,
                'projetos_concluidos' => $projetosConcluidos,
                'debug' => [
                    'decorador_id' => $decoradorId,
                    'projetos_count' => count($projetosConcluidos),
                    'total_aprovados' => $checkResult['total_aprovados'] ?? 0
                ]
            ];
            
        } catch (Exception $e) {
            error_log('Erro ao obter dados do dashboard: ' . $e->getMessage());
            error_log('Erro ao obter dados do dashboard: Stack trace - ' . $e->getTraceAsString());
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
            error_log('getKPIs: Decorador ID = ' . $decoradorId . ', Período: ' . $dateFrom . ' até ' . $dateTo);
            
            // Verificar quantos orçamentos existem no total (todos os status)
            $stmt = $this->pdo->prepare("
                SELECT COUNT(*) as total, 
                       GROUP_CONCAT(DISTINCT status) as status_list
                FROM orcamentos 
                WHERE decorador_id = ? 
            ");
            $stmt->execute([$decoradorId]);
            $totalCheck = $stmt->fetch();
            error_log('getKPIs: Total de orçamentos (todos status): ' . ($totalCheck['total'] ?? 0));
            error_log('getKPIs: Status encontrados: ' . ($totalCheck['status_list'] ?? 'nenhum'));
            
            // Total de festas (TODAS, independente do status, sem filtro de período)
            $stmt = $this->pdo->prepare("
                SELECT COUNT(*) as total
                FROM orcamentos 
                WHERE decorador_id = ? 
            ");
            $stmt->execute([$decoradorId]);
            $festasTotal = $stmt->fetch()['total'];
            error_log('getKPIs: Total de festas (todos status): ' . $festasTotal);
            
            // Festas solicitadas por clientes (criadas via fluxo do cliente) - TODAS
            $stmt = $this->pdo->prepare("
                SELECT COUNT(*) as total
                FROM orcamentos 
                WHERE decorador_id = ? 
                AND created_via = 'client'
            ");
            $stmt->execute([$decoradorId]);
            $festasSolicitadasClientes = $stmt->fetch()['total'];
            error_log('getKPIs: Festas solicitadas por clientes: ' . $festasSolicitadasClientes);
            
            // Festas criadas pelo decorador (inseridas pelo próprio decorador) - TODAS
            $stmt = $this->pdo->prepare("
                SELECT COUNT(*) as total
                FROM orcamentos 
                WHERE decorador_id = ? 
                AND (created_via = 'decorator' OR created_via IS NULL)
            ");
            $stmt->execute([$decoradorId]);
            $festasCriadasDecorador = $stmt->fetch()['total'];
            error_log('getKPIs: Festas criadas pelo decorador: ' . $festasCriadasDecorador);
            
            // Receita recebida (TODOS os orçamentos aprovados, sem filtro de período)
            // Se não houver aprovados, usar todos os orçamentos para calcular receita potencial
            $stmt = $this->pdo->prepare("
                SELECT COALESCE(SUM(valor_estimado), 0) as total
                FROM orcamentos 
                WHERE decorador_id = ? 
                AND status = 'aprovado'
            ");
            $stmt->execute([$decoradorId]);
            $receitaRecebida = $stmt->fetch()['total'];
            error_log('getKPIs: Receita recebida: ' . $receitaRecebida);
            
            // Lucro total (TODOS os projetos com custos lançados, sem filtro de período)
            $stmt = $this->pdo->prepare("
                SELECT COALESCE(SUM(pc.lucro_real_liquido), 0) as total
                FROM projeto_custos pc
                INNER JOIN orcamentos o ON pc.orcamento_id = o.id
                WHERE o.decorador_id = ? 
                AND o.status = 'aprovado'
            ");
            $stmt->execute([$decoradorId]);
            $lucroTotalMes = $stmt->fetch()['total'];
            error_log('getKPIs: Lucro total: ' . $lucroTotalMes);
            
            // Margem média de lucro (TODOS os projetos, sem filtro de período)
            $stmt = $this->pdo->prepare("
                SELECT COALESCE(AVG(pc.margem_lucro_percentual), 0) as media
                FROM projeto_custos pc
                INNER JOIN orcamentos o ON pc.orcamento_id = o.id
                WHERE o.decorador_id = ? 
                AND o.status = 'aprovado'
            ");
            $stmt->execute([$decoradorId]);
            $margemMediaLucro = $stmt->fetch()['media'];
            error_log('getKPIs: Margem média de lucro: ' . $margemMediaLucro);
            
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
            // Contar TODOS os orçamentos nos gráficos (não apenas aprovados)
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
            // Contar TODOS os orçamentos nos gráficos (não apenas aprovados)
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
    
    /**
     * Obter projetos concluídos para lançamento de custos
     */
    private function getProjetosConcluidosParaCustos($decoradorId) {
        try {
            // Log para debug
            error_log('getProjetosConcluidosParaCustos: Decorador ID = ' . $decoradorId);
            
            // Verificar quantos orçamentos existem no total
            $stmtCount = $this->pdo->prepare("
                SELECT COUNT(*) as total, 
                       SUM(CASE WHEN status = 'aprovado' THEN 1 ELSE 0 END) as aprovados,
                       GROUP_CONCAT(DISTINCT status) as status_list
                FROM orcamentos 
                WHERE decorador_id = ?
            ");
            $stmtCount->execute([$decoradorId]);
            $countResult = $stmtCount->fetch();
            error_log('getProjetosConcluidosParaCustos: Total de orçamentos: ' . ($countResult['total'] ?? 0));
            error_log('getProjetosConcluidosParaCustos: Aprovados: ' . ($countResult['aprovados'] ?? 0));
            error_log('getProjetosConcluidosParaCustos: Status encontrados: ' . ($countResult['status_list'] ?? 'nenhum'));
            
            // Buscar TODOS os orçamentos aprovados (sem limite, para que o decorador possa lançar custos em todos)
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
                    o.status,
                    o.decorador_id,
                    CASE WHEN pc.id IS NOT NULL THEN 1 ELSE 0 END as custos_lancados,
                    COALESCE(pc.custo_total_materiais, 0) as custo_total_materiais,
                    COALESCE(pc.custo_total_mao_de_obra, 0) as custo_total_mao_de_obra,
                    COALESCE(pc.custos_diversos, 0) as custos_diversos
                FROM orcamentos o
                LEFT JOIN projeto_custos pc ON o.id = pc.orcamento_id
                WHERE o.decorador_id = ? 
                AND o.status = 'aprovado'
                ORDER BY o.data_evento DESC, o.hora_evento DESC
            ");
            $stmt->execute([$decoradorId]);
            $results = $stmt->fetchAll();
            
            // Log para debug
            error_log('getProjetosConcluidosParaCustos: Encontrados ' . count($results) . ' projeto(s) aprovado(s)');
            
            // Se não encontrou nenhum, tentar buscar sem filtro de status para debug
            if (count($results) === 0) {
                $stmtAll = $this->pdo->prepare("
                    SELECT id, cliente, status, data_evento, decorador_id
                    FROM orcamentos 
                    WHERE decorador_id = ?
                    ORDER BY data_evento DESC
                    LIMIT 10
                ");
                $stmtAll->execute([$decoradorId]);
                $allResults = $stmtAll->fetchAll();
                error_log('getProjetosConcluidosParaCustos: Últimos 10 orçamentos (todos status): ' . json_encode($allResults));
            }
            
            return $results;
            
        } catch (Exception $e) {
            error_log('Erro ao obter projetos concluídos: ' . $e->getMessage());
            error_log('Erro ao obter projetos concluídos: Stack trace - ' . $e->getTraceAsString());
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
