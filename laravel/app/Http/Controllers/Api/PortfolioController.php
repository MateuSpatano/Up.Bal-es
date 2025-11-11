<?php

namespace App\Http\Controllers\Api;

use App\Models\DecoratorPortfolioItem;
use App\Services\PortfolioService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class PortfolioController extends BaseApiController
{
    public function index()
    {
        if ($response = $this->ensureDecorator()) {
            return $response;
        }

        $service = new PortfolioService(Auth::user());

        return $this->success($service->list());
    }

    public function show(DecoratorPortfolioItem $portfolioItem)
    {
        if ($response = $this->ensureDecorator()) {
            return $response;
        }

        if ($portfolioItem->decorator_id !== Auth::id()) {
            return $this->error('Item não encontrado.', 404);
        }

        $service = new PortfolioService(Auth::user());

        return $this->success([
            'item' => $service->get($portfolioItem->id),
        ]);
    }

    public function store(Request $request)
    {
        if ($response = $this->ensureDecorator()) {
            return $response;
        }

        $validated = $this->validateData($request);

        try {
            $service = new PortfolioService(Auth::user());
            $item = $service->create($validated, $request->file('image'));
        } catch (\Throwable $exception) {
            report($exception);

            return $this->error($exception->getMessage(), 422);
        }

        return $this->success(
            ['item' => $item],
            'Serviço adicionado ao portfólio com sucesso!'
        );
    }

    public function update(Request $request, DecoratorPortfolioItem $portfolioItem)
    {
        if ($response = $this->ensureDecorator()) {
            return $response;
        }

        if ($portfolioItem->decorator_id !== Auth::id()) {
            return $this->error('Item não encontrado.', 404);
        }

        $validated = $this->validateData($request, true);

        try {
            $service = new PortfolioService(Auth::user());
            $item = $service->update($portfolioItem->id, $validated, $request->file('image'));
        } catch (\Throwable $exception) {
            report($exception);

            return $this->error($exception->getMessage(), 422);
        }

        return $this->success(
            ['item' => $item],
            'Serviço atualizado com sucesso!'
        );
    }

    public function destroy(DecoratorPortfolioItem $portfolioItem)
    {
        if ($response = $this->ensureDecorator()) {
            return $response;
        }

        if ($portfolioItem->decorator_id !== Auth::id()) {
            return $this->error('Item não encontrado.', 404);
        }

        $service = new PortfolioService(Auth::user());
        $service->delete($portfolioItem->id);

        return $this->success(null, 'Serviço removido do portfólio.');
    }

    public function clear()
    {
        if ($response = $this->ensureDecorator()) {
            return $response;
        }

        $service = new PortfolioService(Auth::user());
        $service->clear();

        return $this->success(null, 'Portfólio removido com sucesso.');
    }

    private function ensureDecorator()
    {
        $user = Auth::user();
        if (!$user || ($user->perfil ?? null) !== 'decorator') {
            return $this->error('Acesso negado.', 403);
        }

        return null;
    }

    /**
     * @return array<string, mixed>
     *
     * @throws ValidationException
     */
    private function validateData(Request $request, bool $partial = false): array
    {
        if ($request->has('arcSize') && !$request->has('arc_size')) {
            $request->merge(['arc_size' => $request->input('arcSize')]);
        }

        $rules = [
            'type' => [$partial ? 'sometimes' : 'required', 'string', 'max:100'],
            'title' => [$partial ? 'sometimes' : 'required', 'string', 'max:150'],
            'description' => ['sometimes', 'nullable', 'string'],
            'price' => ['sometimes', 'nullable', 'string'],
            'arc_size' => ['sometimes', 'nullable', 'string', 'max:120'],
            'is_featured' => ['sometimes', 'boolean'],
            'image' => ['sometimes', 'file', 'image', 'max:5120'],
        ];

        $validated = $request->validate($rules);

        if (isset($validated['price']) && $validated['price'] === '') {
            $validated['price'] = null;
        }

        return $validated;
    }
}

