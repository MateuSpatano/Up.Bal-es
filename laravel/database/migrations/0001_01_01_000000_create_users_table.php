<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('usuarios', function (Blueprint $table) {
            $table->id();
            $table->string('nome', 100);
            $table->string('email', 100)->unique();
            $table->string('email_comunicacao', 100)->nullable();
            $table->string('telefone', 20)->nullable();
            $table->string('whatsapp', 20)->nullable();
            $table->string('instagram', 255)->nullable();
            $table->string('cpf', 14)->nullable();
            $table->string('endereco', 255)->nullable();
            $table->string('cidade', 100)->nullable();
            $table->string('estado', 2)->nullable();
            $table->string('cep', 10)->nullable();
            $table->string('senha', 255);
            $table->string('slug', 100)->unique()->nullable();
            $table->enum('perfil', ['user', 'decorator', 'admin'])->default('user');
            $table->boolean('ativo')->default(true)->index();
            $table->boolean('aprovado_por_admin')->default(false)->index();
            $table->text('bio')->nullable();
            $table->text('especialidades')->nullable();
            $table->json('portfolio_images')->nullable();
            $table->json('redes_sociais')->nullable();
            $table->boolean('is_active')->default(true)->index();
            $table->boolean('is_admin')->default(false)->index();
            $table->boolean('email_verified')->default(false);
            $table->string('email_verification_token', 255)->nullable();
            $table->string('password_reset_token', 255)->nullable();
            $table->timestamp('password_reset_expires')->nullable();
            $table->timestamp('last_login')->nullable();
            $table->timestamps();
        });

        Schema::create('remember_tokens', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('usuarios')->cascadeOnDelete();
            $table->string('token', 255)->unique();
            $table->timestamp('expires_at');
            $table->boolean('is_admin')->default(false)->index();
            $table->timestamps();
        });

        Schema::create('password_reset_tokens', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('usuarios')->cascadeOnDelete();
            $table->string('token', 255)->unique();
            $table->timestamp('expires_at');
            $table->timestamps();
        });

        Schema::create('access_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('usuarios')->nullOnDelete();
            $table->string('action', 50);
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->timestamp('created_at')->useCurrent();
        });

        Schema::create('orcamentos', function (Blueprint $table) {
            $table->id();
            $table->string('cliente', 100);
            $table->string('email', 100);
            $table->string('telefone', 20)->nullable();
            $table->date('data_evento');
            $table->time('hora_evento');
            $table->string('local_evento', 255);
            $table->enum('tipo_servico', ['arco-tradicional', 'arco-desconstruido', 'escultura-balao', 'centro-mesa', 'baloes-piscina']);
            $table->text('descricao')->nullable();
            $table->decimal('valor_estimado', 10, 2)->default(0);
            $table->text('observacoes')->nullable();
            $table->enum('status', ['pendente', 'aprovado', 'recusado', 'cancelado', 'enviado'])->default('pendente')->index();
            $table->foreignId('decorador_id')->constrained('usuarios')->cascadeOnDelete();
            $table->enum('created_via', ['client', 'decorator'])->default('client');
            $table->string('imagem', 255)->nullable();
            $table->decimal('tamanho_arco_m', 4, 1)->nullable();
            $table->timestamps();
        });

        Schema::create('budget_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('budget_id')->constrained('orcamentos')->cascadeOnDelete();
            $table->string('action', 50);
            $table->foreignId('user_id')->nullable()->constrained('usuarios')->nullOnDelete();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->timestamp('created_at')->useCurrent();
        });

        Schema::create('decorator_availability', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('usuarios')->cascadeOnDelete();
            $table->json('available_days')->nullable();
            $table->json('time_schedules')->nullable();
            $table->json('service_intervals')->nullable();
            $table->integer('max_daily_services')->default(3);
            $table->timestamps();

            $table->unique('user_id');
        });

        Schema::create('decorator_blocked_dates', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('usuarios')->cascadeOnDelete();
            $table->date('blocked_date');
            $table->string('reason', 255)->default('Data bloqueada pelo decorador');
            $table->boolean('is_recurring')->default(false);
            $table->timestamps();

            $table->unique(['user_id', 'blocked_date']);
        });

        Schema::create('decorator_page_customization', function (Blueprint $table) {
            $table->id();
            $table->foreignId('decorator_id')->constrained('usuarios')->cascadeOnDelete();
            $table->string('page_title', 255)->nullable();
            $table->text('page_description')->nullable();
            $table->text('welcome_text')->nullable();
            $table->string('cover_image_url', 500)->nullable();
            $table->string('primary_color', 7)->default('#667eea');
            $table->string('secondary_color', 7)->default('#764ba2');
            $table->string('accent_color', 7)->default('#f59e0b');
            $table->json('services_config')->nullable();
            $table->json('social_media')->nullable();
            $table->string('meta_title', 255)->nullable();
            $table->text('meta_description')->nullable();
            $table->string('meta_keywords', 500)->nullable();
            $table->boolean('show_contact_section')->default(true);
            $table->boolean('show_services_section')->default(true);
            $table->boolean('show_portfolio_section')->default(true);
            $table->boolean('is_active')->default(true)->index();
            $table->timestamps();

            $table->unique('decorator_id');
        });

        Schema::create('decorator_portfolio_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('decorator_id')->constrained('usuarios')->cascadeOnDelete();
            $table->string('service_type', 100);
            $table->string('title', 150);
            $table->text('description')->nullable();
            $table->decimal('price', 10, 2)->nullable();
            $table->string('arc_size', 120)->nullable();
            $table->string('image_path', 255)->nullable();
            $table->integer('display_order')->default(0);
            $table->boolean('is_featured')->default(false);
            $table->boolean('is_active')->default(true)->index();
            $table->timestamps();
        });

        Schema::create('projeto_custos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('orcamento_id')->constrained('orcamentos')->cascadeOnDelete();
            $table->decimal('preco_venda', 10, 2)->default(0);
            $table->decimal('custo_total_materiais', 10, 2)->default(0);
            $table->decimal('custo_total_mao_de_obra', 10, 2)->default(0);
            $table->decimal('custos_diversos', 10, 2)->default(0);
            $table->decimal('custo_total_projeto', 10, 2)->default(0);
            $table->decimal('lucro_real_liquido', 10, 2)->default(0);
            $table->decimal('margem_lucro_percentual', 5, 2)->default(0);
            $table->text('observacoes')->nullable();
            $table->timestamps();

            $table->index('orcamento_id');
        });

        Schema::create('sessions', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->foreignId('user_id')->nullable()->index();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->longText('payload');
            $table->integer('last_activity')->index();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('projeto_custos');
        Schema::dropIfExists('decorator_portfolio_items');
        Schema::dropIfExists('decorator_page_customization');
        Schema::dropIfExists('decorator_blocked_dates');
        Schema::dropIfExists('decorator_availability');
        Schema::dropIfExists('budget_logs');
        Schema::dropIfExists('orcamentos');
        Schema::dropIfExists('access_logs');
        Schema::dropIfExists('password_reset_tokens');
        Schema::dropIfExists('remember_tokens');
        Schema::dropIfExists('usuarios');
        Schema::dropIfExists('sessions');
    }
};
