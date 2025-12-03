"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Layout from "@/components/Layout";
import Card from "@/components/Card";
import Button from "@/components/Button";
import Input from "@/components/Input";
import Select from "@/components/Select";

const serviceOptions = [
  { value: "", label: "Selecione um serviço" },
  { value: "Avaliação", label: "Avaliação" },
  { value: "Limpeza", label: "Limpeza" },
  { value: "Canal", label: "Tratamento de Canal" },
  { value: "Extração", label: "Extração" },
  { value: "Clareamento", label: "Clareamento" },
  { value: "Restauração", label: "Restauração" },
  { value: "Prótese", label: "Prótese" },
  { value: "Ortodontia", label: "Ortodontia" },
  { value: "Implante", label: "Implante" },
  { value: "Outro", label: "Outro" },
];

const statusOptions = [
  { value: "PENDING", label: "Pendente" },
  { value: "CONFIRMED", label: "Confirmado" },
];


export default function NewAppointmentPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [dateDisplay, setDateDisplay] = useState("");

  const [formData, setFormData] = useState({
    customerName: "",
    customerPhone: "",
    service: "",
    date: "",
    time: "",
    duration: 60, // Duração fixa de 1 hora
    notes: "",
    status: "CONFIRMED",
  });
  const [phoneDisplay, setPhoneDisplay] = useState("");

  // Função para formatar data DD/MM/YYYY -> YYYY-MM-DD (ISO)
  const convertToISO = (dateStr: string): string => {
    const parts = dateStr
      .replace(/\D/g, "")
      .match(/(\d{0,2})(\d{0,2})(\d{0,4})/);
    if (!parts) return "";

    const [, day, month, year] = parts;
    if (year.length === 4 && month && day) {
      return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
    }
    return "";
  };

  // Formatar input de data DD/MM/YYYY
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");

    // Limitar a 8 dígitos
    if (value.length > 8) value = value.slice(0, 8);

    // Adicionar barras automaticamente
    let formatted = value;
    if (value.length >= 2) {
      formatted = value.slice(0, 2) + "/" + value.slice(2);
    }
    if (value.length >= 4) {
      formatted =
        value.slice(0, 2) + "/" + value.slice(2, 4) + "/" + value.slice(4);
    }

    setDateDisplay(formatted);

    // Converter para formato ISO se data completa
    if (value.length === 8) {
      const isoDate = convertToISO(formatted);
      setFormData({ ...formData, date: isoDate });
    } else {
      setFormData({ ...formData, date: "" });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("adminToken");
      const response = await fetch("/api/appointments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        router.push("/admin/appointments");
      } else {
        const data = await response.json();
        setError(data.message || data.error || "Erro ao criar agendamento");
      }
    } catch (err) {
      setError("Erro ao criar agendamento");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const value =
      e.target.name === "duration" ? Number(e.target.value) : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value,
    });
  };

  return (
    <Layout>
      <div className="space-y-4">
        {/* Header */}
        <div>
          <button
            onClick={() => router.back()}
            className="text-blue-600 font-medium mb-2 flex items-center space-x-1"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            <span>Voltar</span>
          </button>
          <h2 className="text-2xl font-bold text-gray-900">Novo Agendamento</h2>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Card>
            <div className="space-y-4">
              <Input
                label="Nome do Paciente"
                name="customerName"
                value={formData.customerName}
                onChange={handleChange}
                required
                placeholder="Ex: João Silva"
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Telefone *
                </label>
                <input
                  type="tel"
                  value={phoneDisplay}
                  onChange={(e) => {
                    let value = e.target.value.replace(/\D/g, "");
                    if (value.length > 11) value = value.slice(0, 11);

                    // Formatar: (11) 99999-9999
                    let formatted = value;
                    if (value.length >= 2) {
                      formatted = `(${value.slice(0, 2)}) ${value.slice(2)}`;
                    }
                    if (value.length >= 7) {
                      formatted = `(${value.slice(0, 2)}) ${value.slice(2, 7)}-${value.slice(7)}`;
                    }

                    setPhoneDisplay(formatted);
                    setFormData({ ...formData, customerPhone: value });
                  }}
                  required
                  placeholder="(11) 99999-9999"
                  maxLength={15}
                  className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <Select
                label="Serviço"
                name="service"
                value={formData.service}
                onChange={handleChange}
                options={serviceOptions}
                required
              />

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Data *
                  </label>
                  <input
                    type="text"
                    value={dateDisplay}
                    onChange={handleDateChange}
                    placeholder="DD/MM/AAAA"
                    maxLength={10}
                    required
                    className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Horário *
                  </label>
                  <input
                    type="time"
                    name="time"
                    value={formData.time}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <Select
                label="Status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                options={statusOptions}
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Observações (opcional)
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  rows={3}
                  className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Adicione observações sobre o agendamento..."
                />
              </div>
            </div>
          </Card>

          {error && (
            <Card className="bg-red-50 border-red-200">
              <p className="text-red-800 text-sm">{error}</p>
            </Card>
          )}

          <div className="space-y-3">
            <Button type="submit" fullWidth disabled={loading}>
              {loading ? "Criando..." : "Criar Agendamento"}
            </Button>

            <Button
              type="button"
              variant="secondary"
              fullWidth
              onClick={() => router.back()}
            >
              Cancelar
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
