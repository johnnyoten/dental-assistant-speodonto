"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Layout from "@/components/Layout";
import Card from "@/components/Card";
import Button from "@/components/Button";
import Input from "@/components/Input";
import Select from "@/components/Select";
import {
  PhoneIcon,
  CalendarIcon,
  ClockIcon,
  ChatBubbleLeftIcon,
} from "@heroicons/react/24/outline";

const serviceOptions = [
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
  { value: "COMPLETED", label: "Concluído" },
  { value: "CANCELLED", label: "Cancelado" },
];

const durationOptions = [
  { value: "15", label: "15 minutos" },
  { value: "30", label: "30 minutos" },
  { value: "45", label: "45 minutos" },
  { value: "60", label: "1 hora" },
  { value: "90", label: "1h 30min" },
  { value: "120", label: "2 horas" },
  { value: "180", label: "3 horas" },
];

function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (mins === 0) {
    return `${hours}h`;
  }
  return `${hours}h ${mins}min`;
}

export default function AppointmentDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState("");
  const [dateDisplay, setDateDisplay] = useState("");

  const [formData, setFormData] = useState({
    customerName: "",
    customerPhone: "",
    service: "",
    date: "",
    time: "",
    duration: 30,
    notes: "",
    status: "CONFIRMED",
  });

  useEffect(() => {
    fetchAppointment();
  }, [id]);

  // Converter ISO para DD/MM/YYYY
  const formatDateToBR = (isoDate: string): string => {
    const [year, month, day] = isoDate.split("-");
    return `${day}/${month}/${year}`;
  };

  // Converter DD/MM/YYYY para ISO
  const convertToISO = (dateStr: string): string => {
    const parts = dateStr.replace(/\D/g, "").match(/(\d{0,2})(\d{0,2})(\d{0,4})/);
    if (!parts) return "";

    const [, day, month, year] = parts;
    if (year.length === 4 && month && day) {
      return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
    }
    return "";
  };

  // Handler para input de data DD/MM/YYYY
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");

    if (value.length > 8) value = value.slice(0, 8);

    let formatted = value;
    if (value.length >= 2) {
      formatted = value.slice(0, 2) + "/" + value.slice(2);
    }
    if (value.length >= 4) {
      formatted = value.slice(0, 2) + "/" + value.slice(2, 4) + "/" + value.slice(4);
    }

    setDateDisplay(formatted);

    if (value.length === 8) {
      const isoDate = convertToISO(formatted);
      setFormData({ ...formData, date: isoDate });
    } else {
      setFormData({ ...formData, date: "" });
    }
  };

  const fetchAppointment = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const response = await fetch(`/api/appointments/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        const isoDate = data.date.split("T")[0];
        setFormData({
          customerName: data.customerName,
          customerPhone: data.customerPhone,
          service: data.service,
          date: isoDate,
          time: data.time,
          duration: data.duration || 30,
          notes: data.notes || "",
          status: data.status,
        });
        setDateDisplay(formatDateToBR(isoDate));
      }
    } catch (err) {
      setError("Erro ao carregar agendamento");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    setSaving(true);
    setError("");

    try {
      const token = localStorage.getItem("adminToken");
      const response = await fetch(`/api/appointments/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setEditing(false);
        fetchAppointment();
      } else {
        setError("Erro ao atualizar agendamento");
      }
    } catch (err) {
      setError("Erro ao atualizar agendamento");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Tem certeza que deseja excluir este agendamento?")) return;

    setDeleting(true);

    try {
      const token = localStorage.getItem("adminToken");
      const response = await fetch(`/api/appointments/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        router.push("/admin/appointments");
      } else {
        setError("Erro ao excluir agendamento");
      }
    } catch (err) {
      setError("Erro ao excluir agendamento");
    } finally {
      setDeleting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const value = e.target.name === "duration" ? Number(e.target.value) : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value,
    });
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

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
          <h2 className="text-2xl font-bold text-gray-900">
            Detalhes do Agendamento
          </h2>
        </div>

        {/* Conteúdo */}
        {editing ? (
          // Modo Edição
          <div className="space-y-4">
            <Card>
              <div className="space-y-4">
                <Input
                  label="Nome do Paciente"
                  name="customerName"
                  value={formData.customerName}
                  onChange={handleChange}
                />

                <Input
                  label="Telefone"
                  name="customerPhone"
                  type="tel"
                  value={formData.customerPhone}
                  onChange={handleChange}
                />

                <Select
                  label="Serviço"
                  name="service"
                  value={formData.service}
                  onChange={handleChange}
                  options={serviceOptions}
                />

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Data
                    </label>
                    <input
                      type="text"
                      value={dateDisplay}
                      onChange={handleDateChange}
                      placeholder="DD/MM/YYYY"
                      maxLength={10}
                      className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <Input
                    label="Horário"
                    name="time"
                    type="time"
                    value={formData.time}
                    onChange={handleChange}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Select
                    label="Duração"
                    name="duration"
                    value={String(formData.duration)}
                    onChange={handleChange}
                    options={durationOptions}
                  />

                  <Select
                    label="Status"
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    options={statusOptions}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Observações
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData({ ...formData, notes: e.target.value })
                    }
                    rows={3}
                    className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
              <Button onClick={handleUpdate} fullWidth disabled={saving}>
                {saving ? "Salvando..." : "Salvar Alterações"}
              </Button>

              <Button
                variant="secondary"
                fullWidth
                onClick={() => setEditing(false)}
              >
                Cancelar
              </Button>
            </div>
          </div>
        ) : (
          // Modo Visualização
          <div className="space-y-4">
            <Card>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Paciente</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {formData.customerName}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-1">Telefone</p>
                  <a
                    href={`tel:${formData.customerPhone}`}
                    className="flex items-center space-x-2 text-blue-600"
                  >
                    <PhoneIcon className="h-5 w-5" />
                    <span>{formData.customerPhone}</span>
                  </a>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-1">Serviço</p>
                  <p className="text-base font-medium text-gray-900">
                    {formData.service}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Data</p>
                    <div className="flex items-center space-x-2">
                      <CalendarIcon className="h-5 w-5 text-gray-400" />
                      <span className="text-base font-medium">
                        {new Date(
                          formData.date + "T00:00:00"
                        ).toLocaleDateString("pt-BR")}
                      </span>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 mb-1">Horário</p>
                    <div className="flex items-center space-x-2">
                      <ClockIcon className="h-5 w-5 text-gray-400" />
                      <span className="text-base font-medium">
                        {formData.time}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Duração</p>
                    <p className="text-base font-medium text-gray-900">
                      {formatDuration(formData.duration)}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 mb-1">Status</p>
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                        formData.status === "CONFIRMED"
                          ? "bg-green-100 text-green-800"
                          : formData.status === "PENDING"
                          ? "bg-yellow-100 text-yellow-800"
                          : formData.status === "COMPLETED"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {
                        statusOptions.find((s) => s.value === formData.status)
                          ?.label
                      }
                    </span>
                  </div>
                </div>

                {formData.notes && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Observações</p>
                    <p className="text-base text-gray-900 bg-gray-50 p-3 rounded">
                      {formData.notes}
                    </p>
                  </div>
                )}
              </div>
            </Card>

            <div className="space-y-3">
              <Button
                className="mb-3"
                onClick={() => setEditing(true)}
                fullWidth
              >
                Editar Agendamento
              </Button>

              <a
                href={`https://wa.me/+55${formData.customerPhone.replace(
                  /\D/g,
                  ""
                )}`}
                target="_blank"
              >
                <Button
                  variant="success"
                  fullWidth
                  className="flex items-center justify-center space-x-2"
                >
                  <ChatBubbleLeftIcon className="h-5 w-5" />
                  <span>Enviar WhatsApp</span>
                </Button>
              </a>

              <Button
                variant="danger"
                fullWidth
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? "Excluindo..." : "Excluir Agendamento"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
