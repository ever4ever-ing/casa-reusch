export const site = {
  name: "Reusch Models",
  tagline: "Agencia de modelaje VIP en Temuco",
  phone: "+56926144971",
  phoneDisplay: "926144971",
  whatsapp: "56926144971",
  email: "contacto@reuschmodels.cl",
  reference: "Punto de referencia: Portal Temuco",
  address: "Temuco, Región de La Araucanía",
} as const;

export const navLinks = [
  { label: "Inicio", href: "#inicio" },
  { label: "Modelos", href: "#catalogo" },
  { label: "Quiénes somos", href: "#nosotros" },
] as const;

export const services = [
  "Modelaje editorial, comercial y publicitario",
  "Campañas de moda y sesiones fotográficas",
  "Pasarela, eventos y activaciones de marca",
  "Representación y casting de modelos VIP",
] as const;

export const modelFilters = ["Todos", "VIP", "Editorial", "Comercial", "Pasarela"] as const;

export const aboutText =
  "Somos una agencia de modelaje con base en Temuco, especializada en talentos VIP para campañas comerciales, editoriales y eventos de moda. Ofrecemos profesionalismo, puntualidad y acompañamiento en cada producción, dentro y fuera de la región.";
