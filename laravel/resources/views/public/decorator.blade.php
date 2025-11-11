@php
    $decorator = $profile['decorator'];
    $page = $profile['page'];
    $services = $profile['services'];
    $portfolio = $profile['portfolio'];
    $contact = $profile['contact'];
    $colors = $page['colors'];
    $heroStyles = 'background: linear-gradient(135deg, ' . e($colors['primary']) . ' 0%, ' . e($colors['secondary']) . ' 100%);';
    if (!empty($page['cover_image_url'])) {
        $heroStyles .= 'background-image: url(' . e($page['cover_image_url']) . ');background-size: cover;background-position: center;background-blend-mode: overlay;';
    }
@endphp
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $page['meta_title'] }}</title>
    <meta name="description" content="{{ $page['meta_description'] }}">
    <meta name="keywords" content="{{ $page['meta_keywords'] }}">
    <meta property="og:title" content="{{ $page['meta_title'] }}">
    <meta property="og:description" content="{{ $page['meta_description'] }}">
    <meta property="og:type" content="profile">
    <meta property="og:url" content="{{ url()->current() }}">
    @if(!empty($page['cover_image_url']))
        <meta property="og:image" content="{{ $page['cover_image_url'] }}">
    @endif
    <link rel="icon" type="image/x-icon" href="{{ asset('images/favicon.ico') }}">
    <link rel="shortcut icon" type="image/x-icon" href="{{ asset('images/favicon.ico') }}">
    <link rel="apple-touch-icon" href="{{ asset('images/favicon.ico') }}">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="{{ asset('css/estilos.css') }}">
    <style>
        :root {
            --primary-color: {{ $colors['primary'] }};
            --secondary-color: {{ $colors['secondary'] }};
            --accent-color: {{ $colors['accent'] }};
        }
        .service-card {
            transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .service-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 25px rgba(0,0,0,0.1);
        }
        .portfolio-item {
            transition: transform 0.3s ease;
        }
        .portfolio-item:hover {
            transform: scale(1.05);
        }
        .btn-primary {
            background-color: var(--accent-color);
        }
        .btn-primary:hover {
            background-color: var(--primary-color);
        }
    </style>
</head>
<body class="bg-gray-50">
    <nav class="bg-white shadow-lg border-b border-gray-200">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between items-center h-16">
                <div class="flex items-center space-x-3">
                    <div class="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                        <img src="{{ asset('images/Logo System.jpeg') }}" alt="Up.Baloes Logo" class="w-full h-full object-cover rounded-full">
                    </div>
                    <span class="text-xl font-bold text-gray-800">Up.Baloes</span>
                </div>
                <div class="flex items-center space-x-4">
                    <a href="{{ url('/') }}" class="text-gray-700 hover:text-blue-600 transition-colors duration-200">
                        <i class="fas fa-home mr-2"></i>Início
                    </a>
                    <a href="{{ route('solicitacao.cliente') }}" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-200">
                        <i class="fas fa-gift mr-2"></i>Solicitar Serviço
                    </a>
                </div>
            </div>
        </div>
    </nav>

    <section class="text-white py-16" style="{{ $heroStyles }}">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="text-center">
                <div class="w-32 h-32 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <i class="fas fa-user-tie text-6xl text-white"></i>
                </div>
                <h1 class="text-4xl md:text-5xl font-bold mb-4">{{ $page['title'] }}</h1>
                <p class="text-xl text-blue-100 mb-6">{{ $page['description'] }}</p>
                @if(!empty($page['welcome_text']))
                    <p class="text-lg text-blue-200 mb-4">{!! nl2br(e($page['welcome_text'])) !!}</p>
                @endif
                @if(!empty($decorator['city']) || !empty($decorator['state']))
                    <p class="text-sm text-blue-100">
                        <i class="fas fa-map-marker-alt mr-1"></i>
                        {{ trim(($decorator['city'] ?? '') . ', ' . ($decorator['state'] ?? ''), ', ') }}
                    </p>
                @endif
            </div>
        </div>
    </section>

    @if($page['show_contact_section'])
        <section class="py-12 bg-white">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div class="text-center p-6 bg-gray-50 rounded-xl">
                        <div class="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                            <i class="fas fa-envelope text-2xl text-white"></i>
                        </div>
                        <h3 class="text-lg font-semibold text-gray-800">E-mail</h3>
                        <p class="text-gray-600 mt-2">
                            @if(!empty($contact['email']))
                                <a href="{{ $contact['email_link'] }}" class="text-blue-600 hover:text-blue-800">{{ $contact['email'] }}</a>
                            @else
                                Não disponível
                            @endif
                        </p>
                    </div>

                    <div class="text-center p-6 bg-gray-50 rounded-xl">
                        <div class="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                            <i class="fab fa-whatsapp text-2xl text-white"></i>
                        </div>
                        <h3 class="text-lg font-semibold text-gray-800">WhatsApp</h3>
                        <p class="text-gray-600 mt-2">
                            @if(!empty($contact['whatsapp']))
                                <a href="{{ $contact['whatsapp_link'] }}" target="_blank" class="text-green-600 hover:text-green-800">{{ $contact['whatsapp'] }}</a>
                            @else
                                Não disponível
                            @endif
                        </p>
                    </div>

                    <div class="text-center p-6 bg-gray-50 rounded-xl">
                        <div class="w-16 h-16 bg-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                            <i class="fab fa-instagram text-2xl text-white"></i>
                        </div>
                        <h3 class="text-lg font-semibold text-gray-800">Instagram</h3>
                        <p class="text-gray-600 mt-2">
                            @if(!empty($contact['instagram']))
                                @php($instagramHandle = ltrim($contact['instagram'], '@'))
                                <a href="{{ $contact['instagram_link'] }}" target="_blank" class="text-pink-600 hover:text-pink-800">@{{ $instagramHandle }}</a>
                            @else
                                Não disponível
                            @endif
                        </p>
                    </div>
                </div>
            </div>
        </section>
    @endif

    @if($page['show_services_section'] && !empty($services))
        <section class="py-16 bg-gray-100">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="text-center mb-10">
                    <h2 class="text-3xl font-bold text-gray-800">Serviços de Destaque</h2>
                    <p class="text-gray-600 mt-2">Conheça as especialidades oferecidas</p>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                    @foreach($services as $service)
                        <div class="service-card bg-white rounded-xl shadow-sm p-6 {{ $service['highlight'] ? 'border-2 border-blue-500' : '' }}">
                            <div class="flex items-center mb-4">
                                <div class="w-12 h-12 rounded-full flex items-center justify-center {{ $service['highlight'] ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600' }}">
                                    <i class="{{ $service['icon'] ?? 'fas fa-star' }} text-xl"></i>
                                </div>
                                <h3 class="text-xl font-semibold text-gray-800 ml-4">{{ $service['title'] }}</h3>
                            </div>
                            <p class="text-gray-600 mb-4">{{ $service['description'] }}</p>
                            @if(!is_null($service['price']))
                                <p class="text-lg font-semibold text-gray-800">A partir de {{ number_format($service['price'], 2, ',', '.') }}</p>
                            @endif
                        </div>
                    @endforeach
                </div>
            </div>
        </section>
    @endif

    @if($page['show_portfolio_section'])
        <section class="py-16 bg-white">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="text-center mb-10">
                    <h2 class="text-3xl font-bold text-gray-800">Portfólio</h2>
                    <p class="text-gray-600 mt-2">Algumas das criações recentes</p>
                </div>

                @if(empty($portfolio))
                    <div class="text-center py-12 bg-gray-50 rounded-xl">
                        <p class="text-gray-600">O decorador ainda não adicionou itens ao portfólio.</p>
                    </div>
                @else
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                        @foreach($portfolio as $item)
                            <div class="portfolio-item bg-gray-50 rounded-xl overflow-hidden shadow-sm">
                                @if($item['image_url'])
                                    <img src="{{ $item['image_url'] }}" alt="{{ $item['title'] }}" class="w-full h-56 object-cover">
                                @else
                                    <div class="w-full h-56 bg-gray-200 flex items-center justify-center text-gray-500">
                                        <i class="fas fa-camera fa-2x"></i>
                                    </div>
                                @endif
                                <div class="p-5">
                                    <h3 class="text-lg font-semibold text-gray-800 mb-2">{{ $item['title'] }}</h3>
                                    <p class="text-sm text-gray-600 mb-3">{{ $item['description'] }}</p>
                                    <div class="flex items-center justify-between text-sm text-gray-500">
                                        <span><i class="fas fa-tag mr-1"></i>{{ $item['type'] }}</span>
                                        @if(!is_null($item['price']))
                                            <span><i class="fas fa-dollar-sign mr-1"></i>{{ number_format($item['price'], 2, ',', '.') }}</span>
                                        @endif
                                    </div>
                                </div>
                            </div>
                        @endforeach
                    </div>
                @endif
            </div>
        </section>
    @endif

    <footer class="bg-gray-900 text-white py-10 mt-16">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h3 class="text-xl font-semibold mb-2">{{ $decorator['name'] }}</h3>
            <p class="text-gray-400 mb-4">Decoração com balões para momentos inesquecíveis.</p>
            <div class="flex items-center justify-center space-x-4 text-gray-400">
                @if(!empty($contact['whatsapp_link']))
                    <a href="{{ $contact['whatsapp_link'] }}" class="hover:text-white" target="_blank"><i class="fab fa-whatsapp"></i></a>
                @endif
                @if(!empty($contact['instagram_link']))
                    <a href="{{ $contact['instagram_link'] }}" class="hover:text-white" target="_blank"><i class="fab fa-instagram"></i></a>
                @endif
                @if(!empty($contact['email_link']))
                    <a href="{{ $contact['email_link'] }}" class="hover:text-white"><i class="fas fa-envelope"></i></a>
                @endif
            </div>
            <p class="text-sm text-gray-500 mt-6">&copy; {{ now()->year }} Up.Baloes. Todos os direitos reservados.</p>
        </div>
    </footer>
</body>
</html>

