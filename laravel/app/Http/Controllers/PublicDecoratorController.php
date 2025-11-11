<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Api\BaseApiController;
use App\Models\DecoratorPageCustomization;
use App\Models\DecoratorPortfolioItem;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class PublicDecoratorController extends BaseApiController
{
    public function show(Request $request, string $slug)
    {
        $decorator = $this->findDecorator($slug);

        if (!$decorator) {
            return $this->error('Decorador não encontrado.', 404);
        }

        $profile = $this->buildProfile($decorator);

        return $this->success($profile, 'Decorador carregado com sucesso.');
    }

    public function page(string $slug)
    {
        $decorator = $this->findDecorator($slug);

        if (!$decorator) {
            abort(404);
        }

        $profile = $this->buildProfile($decorator);

        return view('public.decorator', [
            'profile' => $profile,
            'slug' => $slug,
        ]);
    }

    private function findDecorator(string $slug): ?User
    {
        return User::query()
            ->where('perfil', 'decorator')
            ->where('slug', $slug)
            ->where('is_active', true)
            ->where('ativo', true)
            ->first();
    }

    /**
     * @return array<string, mixed>
     */
    private function buildProfile(User $decorator): array
    {
        /** @var DecoratorPageCustomization|null $customization */
        $customization = DecoratorPageCustomization::where('decorator_id', $decorator->id)
            ->where('is_active', true)
            ->first();

        $pageTitle = $customization?->page_title ?: "Portfólio de {$decorator->nome}";
        $pageDescription = $customization?->page_description ?: 'Decoração profissional com balões para eventos inesquecíveis.';
        $welcomeText = $customization?->welcome_text;
        $coverImageUrl = $this->resolveMediaUrl($customization?->cover_image_url);

        $page = [
            'title' => $pageTitle,
            'description' => $pageDescription,
            'welcome_text' => $welcomeText,
            'cover_image_url' => $coverImageUrl,
            'colors' => [
                'primary' => $customization?->primary_color ?: '#667eea',
                'secondary' => $customization?->secondary_color ?: '#764ba2',
                'accent' => $customization?->accent_color ?: '#f59e0b',
            ],
            'meta_title' => $customization?->meta_title ?: "{$decorator->nome} - Decoração com Balões | Up.Baloes",
            'meta_description' => $customization?->meta_description ?: $pageDescription,
            'meta_keywords' => $customization?->meta_keywords ?: 'decorador, festas, balões, eventos',
            'show_contact_section' => $customization?->show_contact_section ?? true,
            'show_services_section' => $customization?->show_services_section ?? true,
            'show_portfolio_section' => $customization?->show_portfolio_section ?? true,
        ];

        $services = collect($customization?->services_config ?? [])
            ->map(function ($service, int $index) {
                if (!is_array($service)) {
                    return null;
                }

                return [
                    'id' => $service['id'] ?? ($index + 1),
                    'title' => $service['title'] ?? ($service['name'] ?? ''),
                    'description' => $service['description'] ?? '',
                    'icon' => $service['icon'] ?? null,
                    'price' => isset($service['price']) && $service['price'] !== '' ? (float) $service['price'] : null,
                    'highlight' => (bool) ($service['highlight'] ?? false),
                ];
            })
            ->filter()
            ->values()
            ->all();

        $portfolio = DecoratorPortfolioItem::where('decorator_id', $decorator->id)
            ->where('is_active', true)
            ->orderByDesc('display_order')
            ->orderByDesc('created_at')
            ->get()
            ->map(function (DecoratorPortfolioItem $item) {
                return [
                    'id' => $item->id,
                    'type' => $item->service_type,
                    'title' => $item->title,
                    'description' => $item->description,
                    'price' => $item->price !== null ? (float) $item->price : null,
                    'arc_size' => $item->arc_size,
                    'image_url' => $this->resolveMediaUrl($item->image_path),
                    'is_featured' => (bool) $item->is_featured,
                ];
            })
            ->values()
            ->all();

        $contact = $this->buildContactData($decorator, $customization);

        return [
            'decorator' => [
                'id' => $decorator->id,
                'name' => $decorator->nome,
                'slug' => $decorator->slug,
                'bio' => $decorator->bio,
                'specialties' => $this->decodeJson($decorator->especialidades),
                'city' => $decorator->cidade,
                'state' => $decorator->estado,
            ],
            'page' => $page,
            'services' => $services,
            'portfolio' => $portfolio,
            'contact' => $contact,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function buildContactData(User $decorator, ?DecoratorPageCustomization $customization): array
    {
        $email = $decorator->email_comunicacao ?: $decorator->email ?: '';
        $whatsapp = $decorator->whatsapp ?: $decorator->telefone ?: '';
        $instagram = $decorator->instagram ?: '';

        $social = $customization?->social_media ?? [];
        $social = is_array($social) ? $social : [];

        $social = array_merge([
            'whatsapp' => $whatsapp,
            'instagram' => $instagram,
        ], $social);

        return [
            'email' => $email,
            'email_link' => $email ? 'mailto:' . $email : null,
            'whatsapp' => $whatsapp,
            'whatsapp_link' => $this->buildWhatsappLink($whatsapp),
            'instagram' => $instagram,
            'instagram_link' => $this->buildInstagramLink($instagram),
            'social_media' => $social,
        ];
    }

    private function resolveMediaUrl(?string $path): ?string
    {
        if (!$path) {
            return null;
        }

        $trimmed = trim($path);

        if (Str::startsWith($trimmed, ['http://', 'https://'])) {
            return $trimmed;
        }

        return asset($trimmed);
    }

    private function buildWhatsappLink(?string $phone): ?string
    {
        if (!$phone) {
            return null;
        }

        $numbers = preg_replace('/\D+/', '', $phone);

        return $numbers !== '' ? 'https://wa.me/' . $numbers : null;
    }

    private function buildInstagramLink(?string $handle): ?string
    {
        if (!$handle) {
            return null;
        }

        $trimmed = ltrim(trim($handle), '@');

        if (Str::startsWith($trimmed, ['http://', 'https://'])) {
            return $trimmed;
        }

        return 'https://instagram.com/' . $trimmed;
    }

    private function decodeJson(mixed $value, mixed $default = []): mixed
    {
        if (empty($value)) {
            return $default;
        }

        $decoded = json_decode($value, true);

        return is_array($decoded) ? $decoded : $default;
    }
}

