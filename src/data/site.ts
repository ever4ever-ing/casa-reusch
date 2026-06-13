export const site = {
  name: "Reusch Models",
  tagline: "Agencia VIP en Temuco",
  phone: "+56926144971",
  phoneDisplay: "926144971",
  whatsapp: "56926144971",
  email: "contacto@reuschmodels.cl",
  reference: "Punto de referencia: Casino Temuco",
  address: "Temuco, Región de La Araucanía",
} as const;

export const navLinks = [
  { label: "Inicio", href: "#inicio" },
  { label: "Modelos", href: "#catalogo" },
  { label: "Quiénes somos", href: "#nosotros" },
] as const;

export const modelFilters = ["Todos", "VIP", "Editorial", "Comercial", "Pasarela"] as const;

export const aboutText =
  "Somos una agencia de acompañantes VIP en Temuco, especializada en servicios dentro y fuera de la región.";
