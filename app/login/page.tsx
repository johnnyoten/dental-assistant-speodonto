"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/Button";
import Input from "@/components/Input";
import Card from "@/components/Card";

export default function LoginPage() {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Verifica se já está logado
    const savedToken = localStorage.getItem("adminToken");
    if (savedToken) {
      router.push("/admin");
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Testa o token fazendo uma requisição
    try {
      const response = await fetch("/api/appointments", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        localStorage.setItem("adminToken", token);
        router.push("/admin");
      } else {
        setError("Token inválido");
      }
    } catch (err) {
      setError("Erro ao validar token");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🦷</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Clínica Odontológica
          </h1>
          <p className="text-gray-600">Painel Administrativo</p>
        </div>

        {/* Formulário de Login */}
        <Card>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Acesso Administrativo
              </h2>
              <p className="text-sm text-gray-600 mb-4">
                Digite o token de acesso para continuar
              </p>
            </div>

            <Input
              label="Token de Acesso"
              type="password"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Digite seu token"
              required
              error={error}
            />

            <Button type="submit" fullWidth disabled={loading || !token}>
              {loading ? "Validando..." : "Acessar Painel"}
            </Button>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <p className="text-xs text-gray-700">
                <strong>💡 Dica:</strong> O token de acesso é definido na
                variável de ambiente{" "}
                <code className="bg-white px-1 py-0.5 rounded">
                  ADMIN_TOKEN
                </code>
              </p>
            </div>
          </form>
        </Card>

        {/* Footer */}
        <p className="text-center text-sm text-gray-600 mt-6">
          Sistema de Agendamento Inteligente
        </p>
      </div>
    </div>
  );
}
