<?php

namespace App\Services;

use App\Models\DecoratorPortfolioItem;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\File;

class PortfolioService
{
    public function __construct(private readonly User $decorator)
    {
    }

    /**
     * @return array<string, mixed>
     */
    public function list(): array
    {
        $items = DecoratorPortfolioItem::where('decorator_id', $this->decorator->id)
            ->where('is_active', true)
            ->orderByDesc('display_order')
            ->orderByDesc('created_at')
            ->get();

        return [
            'items' => $items->map(fn (DecoratorPortfolioItem $item) => $this->transform($item))->all(),
            'total' => $items->count(),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public function get(int $id): array
    {
        $item = $this->findOwnedItem($id);

        return $this->transform($item);
    }

    /**
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    public function create(array $data, ?UploadedFile $image = null): array
    {
        $item = new DecoratorPortfolioItem();
        $item->decorator_id = $this->decorator->id;
        $item->service_type = $data['type'];
        $item->title = $data['title'];
        $item->description = $data['description'] ?? null;
        $item->price = $this->normalizeDecimal($data['price'] ?? null);
        $item->arc_size = $data['arc_size'] ?? null;
        $item->display_order = $this->nextDisplayOrder();
        $item->is_featured = (bool) ($data['is_featured'] ?? false);
        $item->is_active = true;

        if ($image) {
            $item->image_path = $this->storeImage($image);
        }

        $item->save();

        return $this->transform($item->refresh());
    }

    /**
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    public function update(int $id, array $data, ?UploadedFile $image = null): array
    {
        $item = $this->findOwnedItem($id);

        $item->service_type = $data['type'] ?? $item->service_type;
        $item->title = $data['title'] ?? $item->title;
        $item->description = array_key_exists('description', $data)
            ? ($data['description'] ?? null)
            : $item->description;
        $item->price = array_key_exists('price', $data)
            ? $this->normalizeDecimal($data['price'])
            : $item->price;
        $item->arc_size = array_key_exists('arc_size', $data)
            ? ($data['arc_size'] ?? null)
            : $item->arc_size;
        $item->is_featured = array_key_exists('is_featured', $data)
            ? (bool) $data['is_featured']
            : $item->is_featured;

        if ($image) {
            $item->image_path = $this->storeImage($image, $item->image_path);
        }

        $item->save();

        return $this->transform($item->refresh());
    }

    public function delete(int $id): void
    {
        $item = $this->findOwnedItem($id);

        if ($item->image_path) {
            $this->deleteImage($item->image_path);
        }

        $item->delete();
    }

    public function clear(): void
    {
        $items = DecoratorPortfolioItem::where('decorator_id', $this->decorator->id)->get();

        foreach ($items as $item) {
            if ($item->image_path) {
                $this->deleteImage($item->image_path);
            }
            $item->delete();
        }
    }

    private function findOwnedItem(int $id): DecoratorPortfolioItem
    {
        return DecoratorPortfolioItem::where('decorator_id', $this->decorator->id)
            ->where('id', $id)
            ->firstOrFail();
    }

    private function nextDisplayOrder(): int
    {
        $max = DecoratorPortfolioItem::where('decorator_id', $this->decorator->id)->max('display_order');

        return (int) ($max ?? 0) + 1;
    }

    /**
     * @return array<string, mixed>
     */
    private function transform(DecoratorPortfolioItem $item): array
    {
        $imagePath = $item->image_path;
        $imageUrl = $imagePath ? asset($imagePath) : null;

        return [
            'id' => $item->id,
            'type' => $item->service_type,
            'title' => $item->title,
            'description' => $item->description,
            'price' => $item->price !== null ? (float) $item->price : null,
            'arcSize' => $item->arc_size,
            'image' => $imageUrl,
            'image_path' => $imagePath,
            'display_order' => $item->display_order,
            'is_featured' => (bool) $item->is_featured,
            'created_at' => optional($item->created_at)->toDateTimeString(),
            'updated_at' => optional($item->updated_at)->toDateTimeString(),
        ];
    }

    private function storeImage(UploadedFile $file, ?string $existingPath = null): string
    {
        if (!$file->isValid()) {
            throw new \RuntimeException('Arquivo de imagem inválido.');
        }

        if ($file->getSize() > 5 * 1024 * 1024) {
            throw new \RuntimeException('Imagem excede o tamanho máximo de 5MB.');
        }

        $allowedMime = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (!in_array($file->getMimeType(), $allowedMime, true)) {
            throw new \RuntimeException('Formato de imagem não suportado. Use JPG, PNG, GIF ou WebP.');
        }

        $directory = public_path('uploads/portfolio');
        if (!is_dir($directory)) {
            File::makeDirectory($directory, 0755, true);
        }

        $fileName = 'portfolio_' . $this->decorator->id . '_' . time() . '_' . bin2hex(random_bytes(4)) . '.' . $file->getClientOriginalExtension();
        $file->move($directory, $fileName);

        if ($existingPath && $existingPath !== 'uploads/portfolio/' . $fileName) {
            $this->deleteImage($existingPath);
        }

        return 'uploads/portfolio/' . $fileName;
    }

    private function deleteImage(string $relativePath): void
    {
        $fullPath = public_path($relativePath);

        if (File::exists($fullPath)) {
            File::delete($fullPath);
        }
    }

    private function normalizeDecimal($value): ?float
    {
        if ($value === null || $value === '') {
            return null;
        }

        $normalized = str_replace(['.', ','], ['', '.'], (string) $value);

        if (!is_numeric($normalized)) {
            return null;
        }

        return round((float) $normalized, 2);
    }
}

