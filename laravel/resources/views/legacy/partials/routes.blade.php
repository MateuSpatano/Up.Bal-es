<script>
    (function () {
        const routes = {
            home: @json(route('login')),
            login: @json(route('login')),
            cadastro: @json(route('cadastro')),
            adminLogin: @json(route('admin.login')),
            adminDashboard: @json(route('admin.dashboard')),
            decoratorDashboard: @json(route('painel.decorador')),
            resetPassword: @json(route('password.reset')),
            solicitacaoCliente: @json(route('solicitacao.cliente')),
        };

        window.UpBaloesRoutes = Object.assign({}, routes, window.UpBaloesRoutes || {});

        window.UpBaloesApiBase = window.UpBaloesApiBase || @json(url('/api/auth'));
        window.UpBaloesAdminBase = window.UpBaloesAdminBase || @json(url('/api/admin'));
        window.UpBaloesDecoratorBase = window.UpBaloesDecoratorBase || @json(url('/api/decorator'));
        window.UpBaloesPublicApiBase = window.UpBaloesPublicApiBase || @json(url('/api/public'));
    })();
</script>

