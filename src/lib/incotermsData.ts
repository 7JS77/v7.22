// ─────────────────────────────────────────────────────────────────────────────
// src/lib/incotermsData.ts
// ICC Incoterms® 2020 — Full trilingual data with responsibilities & timeline
// ─────────────────────────────────────────────────────────────────────────────

export type Responsibility = 'Seller' | 'Buyer' | 'Negotiable';
export type TransportMode = 'any' | 'sea';

/**
 * Index into the 5-step transfer timeline:
 *   0 → Origin / Seller's Premises
 *   1 → Export Terminal / Alongside Ship
 *   2 → On Board Vessel / Handed to First Carrier
 *   3 → Import Port / Destination Terminal
 *   4 → Final Destination (Named Place)
 */
export type TimelineStep = 0 | 1 | 2 | 3 | 4;

export interface IncotermsResponsibilities {
  exportClearance: Responsibility;
  loadingAtOrigin: Responsibility;
  mainCarriage: Responsibility;
  insurance: Responsibility;
  unloadingAtDestination: Responsibility;
  importClearance: Responsibility;
}

export interface Incoterm {
  /** Three-letter ICC code, e.g. "EXW" */
  code: string;
  name: string;
  nameDE: string;
  nameES: string;
  description: string;
  descriptionDE: string;
  descriptionES: string;
  /** Transport mode constraint */
  mode: TransportMode;
  /** Human-readable location/event where transfer occurs */
  transferPoint: string;
  /** Timeline step (0–4) at which RISK transfers to Buyer */
  riskTransferStep: TimelineStep;
  /** Timeline step (0–4) at which COST transfers to Buyer */
  costTransferStep: TimelineStep;
  responsibilities: IncotermsResponsibilities;
}

// ─────────────────────────────────────────────────────────────────────────────
// ICC Incoterms® 2020 — Complete Rules
// ─────────────────────────────────────────────────────────────────────────────

export const INCOTERMS: readonly Incoterm[] = [

  // ── Group 1: Rules for Any Mode or Modes of Transport ──────────────────────

  {
    code: 'EXW',
    name: 'Ex Works',
    nameDE: 'Ab Werk',
    nameES: 'En Fábrica',
    description:
      'The seller makes the goods available at their premises or another named place. The buyer bears all risks and costs from that point forward, including loading, export clearance, and the entire carriage. This rule represents the minimum obligation for the seller and maximum obligation for the buyer.',
    descriptionDE:
      'Der Verkäufer stellt die Ware in seinen Räumlichkeiten oder an einem anderen benannten Ort zur Verfügung. Der Käufer trägt alle Risiken und Kosten ab diesem Punkt, einschließlich Verladung, Ausfuhrzollabfertigung und der gesamten Beförderung. Diese Regel stellt die minimale Verpflichtung für den Verkäufer und die maximale für den Käufer dar.',
    descriptionES:
      'El vendedor pone las mercancías a disposición en sus instalaciones u otro lugar designado. El comprador asume todos los riesgos y costos desde ese punto, incluyendo carga, despacho de exportación y el transporte completo. Esta regla representa la mínima obligación para el vendedor y la máxima para el comprador.',
    mode: 'any',
    transferPoint: "Origin — Seller's Premises",
    riskTransferStep: 0,
    costTransferStep: 0,
    responsibilities: {
      exportClearance: 'Buyer',
      loadingAtOrigin: 'Buyer',
      mainCarriage: 'Buyer',
      insurance: 'Buyer',
      unloadingAtDestination: 'Buyer',
      importClearance: 'Buyer',
    },
  },

  {
    code: 'FCA',
    name: 'Free Carrier',
    nameDE: 'Frei Frachtführer',
    nameES: 'Franco Transportista',
    description:
      'The seller delivers the goods to the carrier or another nominated person at the seller\'s premises or another named place. Risk and cost transfer upon delivery to the first carrier. The ICC Incoterms® 2020 revision notably allows the buyer to instruct the carrier to issue an on-board bill of lading to the seller, enabling its use in documentary credit transactions.',
    descriptionDE:
      'Der Verkäufer liefert die Ware dem Frachtführer oder einer anderen benannten Person an den Räumlichkeiten des Verkäufers oder an einem anderen benannten Ort. Risiko und Kosten gehen bei der Übergabe an den ersten Frachtführer über. Die Revision ICC Incoterms® 2020 ermöglicht dem Käufer, den Frachtführer anzuweisen, dem Verkäufer ein Bordkonnossement auszustellen, was die Verwendung bei Dokumentenakkreditiven ermöglicht.',
    descriptionES:
      'El vendedor entrega las mercancías al transportista o a otra persona designada en sus instalaciones o en otro lugar designado. El riesgo y el costo se transfieren al momento de la entrega al primer transportista. La revisión ICC Incoterms® 2020 permite notablemente al comprador instruir al transportista para emitir un conocimiento de embarque al vendedor, posibilitando su uso en créditos documentarios.',
    mode: 'any',
    transferPoint: 'Named Place — First Carrier',
    riskTransferStep: 2,
    costTransferStep: 2,
    responsibilities: {
      exportClearance: 'Seller',
      loadingAtOrigin: 'Seller',
      mainCarriage: 'Buyer',
      insurance: 'Negotiable',
      unloadingAtDestination: 'Buyer',
      importClearance: 'Buyer',
    },
  },

  {
    code: 'CPT',
    name: 'Carriage Paid To',
    nameDE: 'Frachtfrei',
    nameES: 'Transporte Pagado Hasta',
    description:
      'The seller contracts and pays for carriage to the named place of destination. However, risk transfers to the buyer when goods are delivered to the first carrier — before the main voyage begins. This critical split means the buyer bears risk for the entire main journey even though the seller has paid for it. The buyer should arrange their own cargo insurance.',
    descriptionDE:
      'Der Verkäufer schließt einen Vertrag und zahlt für die Beförderung bis zum benannten Bestimmungsort. Das Risiko geht jedoch auf den Käufer über, wenn die Ware dem ersten Frachtführer übergeben wird – bevor die Hauptreise beginnt. Diese wichtige Aufspaltung bedeutet, dass der Käufer das Risiko für die gesamte Hauptreise trägt, obwohl der Verkäufer dafür bezahlt hat. Der Käufer sollte eine eigene Transportversicherung abschließen.',
    descriptionES:
      'El vendedor contrata y paga el transporte hasta el lugar de destino designado. Sin embargo, el riesgo se transfiere al comprador cuando las mercancías se entregan al primer transportista, antes de que comience el viaje principal. Esta división crítica significa que el comprador asume el riesgo de todo el trayecto principal aunque el vendedor lo haya pagado. El comprador debe contratar su propio seguro de carga.',
    mode: 'any',
    transferPoint: 'First Carrier (Risk) / Named Destination (Cost)',
    riskTransferStep: 2,
    costTransferStep: 4,
    responsibilities: {
      exportClearance: 'Seller',
      loadingAtOrigin: 'Seller',
      mainCarriage: 'Seller',
      insurance: 'Negotiable',
      unloadingAtDestination: 'Buyer',
      importClearance: 'Buyer',
    },
  },

  {
    code: 'CIP',
    name: 'Carriage and Insurance Paid To',
    nameDE: 'Frachtfrei versichert',
    nameES: 'Transporte y Seguro Pagados Hasta',
    description:
      'Like CPT, but the seller also provides cargo insurance for the buyer\'s risk. A major change in Incoterms® 2020: CIP now mandates all-risk cover under Institute Cargo Clauses (A) — a significant upgrade from the previous minimum cover. Risk still transfers at the first carrier; cost and insurance are paid to the named destination.',
    descriptionDE:
      'Wie CPT, aber der Verkäufer stellt auch eine Transportversicherung für das Risiko des Käufers bereit. Eine wesentliche Änderung in Incoterms® 2020: CIP schreibt nun eine Allrisikodeckung gemäß Institute Cargo Clauses (A) vor – eine erhebliche Aufwertung gegenüber der bisherigen Mindestdeckung. Das Risiko geht weiterhin beim ersten Frachtführer über; Kosten und Versicherung werden bis zum benannten Bestimmungsort bezahlt.',
    descriptionES:
      'Como CPT, pero el vendedor también proporciona seguro de carga para el riesgo del comprador. Un cambio importante en Incoterms® 2020: CIP ahora exige cobertura a todo riesgo según Institute Cargo Clauses (A), una mejora significativa respecto a la cobertura mínima anterior. El riesgo aún se transfiere al primer transportista; el costo y el seguro se pagan hasta el lugar de destino designado.',
    mode: 'any',
    transferPoint: 'First Carrier (Risk) / Named Destination (Cost & Insurance)',
    riskTransferStep: 2,
    costTransferStep: 4,
    responsibilities: {
      exportClearance: 'Seller',
      loadingAtOrigin: 'Seller',
      mainCarriage: 'Seller',
      insurance: 'Seller',
      unloadingAtDestination: 'Buyer',
      importClearance: 'Buyer',
    },
  },

  {
    code: 'DAP',
    name: 'Delivered at Place',
    nameDE: 'Geliefert benannter Ort',
    nameES: 'Entregado en Lugar',
    description:
      'The seller delivers goods to the buyer at the named place of destination, ready for unloading. The seller bears all risks and costs until that point. Import duties, taxes, and unloading at destination are the buyer\'s responsibility. DAP is well-suited for multimodal transport and is one of the most commonly used Incoterms rules.',
    descriptionDE:
      'Der Verkäufer liefert die Ware an den Käufer am benannten Bestimmungsort, entladebereit. Der Verkäufer trägt alle Risiken und Kosten bis zu diesem Punkt. Einfuhrzölle, Steuern und Entladung am Bestimmungsort liegen in der Verantwortung des Käufers. DAP eignet sich gut für multimodale Transporte und ist eine der am häufigsten verwendeten Incoterms-Regeln.',
    descriptionES:
      'El vendedor entrega las mercancías al comprador en el lugar de destino designado, listas para descargar. El vendedor asume todos los riesgos y costos hasta ese punto. Los derechos de importación, impuestos y la descarga en destino son responsabilidad del comprador. DAP es adecuado para el transporte multimodal y es una de las reglas Incoterms más utilizadas.',
    mode: 'any',
    transferPoint: 'Named Place of Destination — Ready for Unloading',
    riskTransferStep: 4,
    costTransferStep: 4,
    responsibilities: {
      exportClearance: 'Seller',
      loadingAtOrigin: 'Seller',
      mainCarriage: 'Seller',
      insurance: 'Negotiable',
      unloadingAtDestination: 'Buyer',
      importClearance: 'Buyer',
    },
  },

  {
    code: 'DPU',
    name: 'Delivered at Place Unloaded',
    nameDE: 'Geliefert benannter Ort entladen',
    nameES: 'Entregado en Lugar Descargado',
    description:
      'Formerly DAT (Delivered at Terminal), renamed in Incoterms® 2020 to reflect its broader applicability beyond terminals. The seller delivers goods unloaded from the arriving means of transport at the named place of destination. This is the only rule where the seller bears the cost and risk of unloading at destination. The buyer handles import clearance.',
    descriptionDE:
      'Früher DAT (Geliefert Terminal), in Incoterms® 2020 umbenannt, um die breitere Anwendbarkeit über Terminals hinaus widerzuspiegeln. Der Verkäufer liefert die Ware entladen vom ankommenden Transportmittel am benannten Bestimmungsort. Dies ist die einzige Regel, bei der der Verkäufer die Kosten und das Risiko der Entladung am Bestimmungsort trägt. Der Käufer übernimmt die Einfuhrzollabfertigung.',
    descriptionES:
      'Anteriormente DAT (Entregado en Terminal), renombrado en Incoterms® 2020 para reflejar su aplicabilidad más amplia más allá de las terminales. El vendedor entrega las mercancías descargadas del medio de transporte de llegada en el lugar de destino designado. Esta es la única regla donde el vendedor asume el costo y riesgo de descarga en destino. El comprador gestiona el despacho de importación.',
    mode: 'any',
    transferPoint: 'Named Place of Destination — After Unloading',
    riskTransferStep: 4,
    costTransferStep: 4,
    responsibilities: {
      exportClearance: 'Seller',
      loadingAtOrigin: 'Seller',
      mainCarriage: 'Seller',
      insurance: 'Negotiable',
      unloadingAtDestination: 'Seller',
      importClearance: 'Buyer',
    },
  },

  {
    code: 'DDP',
    name: 'Delivered Duty Paid',
    nameDE: 'Geliefert verzollt',
    nameES: 'Entregado con Derechos Pagados',
    description:
      'The maximum obligation for the seller. Goods are delivered to the buyer at the named destination, cleared for import, with all applicable duties and taxes paid by the seller. This is the mirror image of EXW. Note: The seller must be able to handle import customs in the destination country; VAT/GST at destination may still technically fall on the buyer depending on jurisdiction.',
    descriptionDE:
      'Die maximale Verpflichtung für den Verkäufer. Die Ware wird an den Käufer am benannten Bestimmungsort geliefert, eingeführt, mit allen vom Verkäufer bezahlten Zöllen und Steuern. Dies ist das Spiegelbild von EXW. Hinweis: Der Verkäufer muss in der Lage sein, die Einfuhrzollabfertigung im Bestimmungsland zu übernehmen; Mehrwertsteuer/GST am Bestimmungsort kann je nach Gerichtsbarkeit technisch noch beim Käufer liegen.',
    descriptionES:
      'La máxima obligación para el vendedor. Las mercancías se entregan al comprador en el lugar de destino designado, despachadas de importación, con todos los derechos e impuestos pagados por el vendedor. Es el reflejo de EXW. Nota: El vendedor debe poder gestionar la aduana de importación en el país de destino; el IVA/GST en destino puede recaer técnicamente en el comprador según la jurisdicción.',
    mode: 'any',
    transferPoint: 'Named Place of Destination — All Duties & Taxes Paid',
    riskTransferStep: 4,
    costTransferStep: 4,
    responsibilities: {
      exportClearance: 'Seller',
      loadingAtOrigin: 'Seller',
      mainCarriage: 'Seller',
      insurance: 'Negotiable',
      unloadingAtDestination: 'Buyer',
      importClearance: 'Seller',
    },
  },

  // ── Group 2: Rules for Sea and Inland Waterway Transport ───────────────────

  {
    code: 'FAS',
    name: 'Free Alongside Ship',
    nameDE: 'Frei Längsseite Schiff',
    nameES: 'Franco al Costado del Buque',
    description:
      'The seller delivers goods alongside the nominated vessel at the named port of shipment, cleared for export. Risk and cost transfer at that point; the buyer bears all costs from loading onto the vessel through to final destination. FAS is appropriate only for conventional cargo and bulk shipments — not containerised goods.',
    descriptionDE:
      'Der Verkäufer liefert die Ware für den Export verzollt längsseits des benannten Schiffes im benannten Verschiffungshafen. Risiko und Kosten gehen ab diesem Zeitpunkt über; der Käufer trägt alle Kosten ab der Verladung auf das Schiff bis zum endgültigen Bestimmungsort. FAS eignet sich nur für herkömmliche Fracht und Schüttgut – nicht für containerisierte Güter.',
    descriptionES:
      'El vendedor entrega las mercancías al costado del buque designado en el puerto de embarque designado, despachadas para exportación. El riesgo y el costo se transfieren en ese punto; el comprador asume todos los costos desde la carga a bordo del buque hasta el destino final. FAS es apropiado solo para carga convencional y graneles, no para mercancías en contenedor.',
    mode: 'sea',
    transferPoint: 'Alongside Ship — Port of Export',
    riskTransferStep: 1,
    costTransferStep: 1,
    responsibilities: {
      exportClearance: 'Seller',
      loadingAtOrigin: 'Buyer',
      mainCarriage: 'Buyer',
      insurance: 'Buyer',
      unloadingAtDestination: 'Buyer',
      importClearance: 'Buyer',
    },
  },

  {
    code: 'FOB',
    name: 'Free On Board',
    nameDE: 'Frei an Bord',
    nameES: 'Franco a Bordo',
    description:
      'The seller delivers goods on board the vessel nominated by the buyer at the named port of shipment. Risk and cost transfer once goods cross the ship\'s rail. The seller handles export clearance and loading. The buyer arranges and pays for main carriage and insurance. FOB is one of the most widely used rules but is only appropriate for non-containerised cargo.',
    descriptionDE:
      'Der Verkäufer liefert die Ware an Bord des vom Käufer benannten Schiffes im benannten Verschiffungshafen. Risiko und Kosten gehen über, sobald die Ware die Reling des Schiffes passiert. Der Verkäufer übernimmt Ausfuhrzollabfertigung und Verladung. Der Käufer arrangiert und bezahlt die Hauptbeförderung und Versicherung. FOB ist eine der am weitesten verbreiteten Regeln, eignet sich aber nur für nicht containerisierte Fracht.',
    descriptionES:
      'El vendedor entrega las mercancías a bordo del buque designado por el comprador en el puerto de embarque designado. El riesgo y el costo se transfieren cuando las mercancías cruzan la borda del buque. El vendedor gestiona el despacho de exportación y la carga. El comprador organiza y paga el transporte principal y el seguro. FOB es una de las reglas más utilizadas, pero es adecuada solo para carga no containerizada.',
    mode: 'sea',
    transferPoint: 'On Board Vessel — Port of Export',
    riskTransferStep: 2,
    costTransferStep: 2,
    responsibilities: {
      exportClearance: 'Seller',
      loadingAtOrigin: 'Seller',
      mainCarriage: 'Buyer',
      insurance: 'Buyer',
      unloadingAtDestination: 'Buyer',
      importClearance: 'Buyer',
    },
  },

  {
    code: 'CFR',
    name: 'Cost and Freight',
    nameDE: 'Kosten und Fracht',
    nameES: 'Costo y Flete',
    description:
      'The seller pays for freight to the named destination port, but risk transfers to the buyer when goods are placed on board the vessel at the port of shipment — before the main voyage. This means the buyer bears the risk for the entire ocean leg even though the seller has paid the freight. The buyer must arrange their own insurance and handles unloading and import clearance.',
    descriptionDE:
      'Der Verkäufer übernimmt die Frachtkosten bis zum benannten Bestimmungshafen, aber das Risiko geht auf den Käufer über, wenn die Ware am Verschiffungshafen an Bord des Schiffes gebracht wird – vor der Hauptreise. Das bedeutet, dass der Käufer das Risiko für die gesamte Seestrecke trägt, obwohl der Verkäufer die Fracht bezahlt hat. Der Käufer muss seine eigene Versicherung abschließen und übernimmt Entladung und Einfuhrzollabfertigung.',
    descriptionES:
      'El vendedor paga el flete hasta el puerto de destino designado, pero el riesgo se transfiere al comprador cuando las mercancías se colocan a bordo del buque en el puerto de embarque, antes del viaje principal. Esto significa que el comprador asume el riesgo durante todo el trayecto marítimo aunque el vendedor haya pagado el flete. El comprador debe contratar su propio seguro y gestiona la descarga y el despacho de importación.',
    mode: 'sea',
    transferPoint: 'On Board Vessel (Risk) / Destination Port (Cost)',
    riskTransferStep: 2,
    costTransferStep: 3,
    responsibilities: {
      exportClearance: 'Seller',
      loadingAtOrigin: 'Seller',
      mainCarriage: 'Seller',
      insurance: 'Buyer',
      unloadingAtDestination: 'Buyer',
      importClearance: 'Buyer',
    },
  },

  {
    code: 'CIF',
    name: 'Cost, Insurance and Freight',
    nameDE: 'Kosten, Versicherung, Fracht',
    nameES: 'Costo, Seguro y Flete',
    description:
      'Like CFR, the seller pays freight to the destination port, but also provides minimum marine insurance (Institute Cargo Clauses C) for the buyer\'s risk during the main voyage. Note: Incoterms® 2020 retained minimum cover (ICC C) for CIF — unlike CIP which was upgraded to all-risk (ICC A). Risk still transfers to the buyer when goods are on board at the port of shipment.',
    descriptionDE:
      'Wie CFR übernimmt der Verkäufer die Frachtkosten bis zum Bestimmungshafen, stellt aber auch eine Mindest-Seetransportversicherung (Institute Cargo Clauses C) für das Risiko des Käufers während der Hauptreise bereit. Hinweis: Incoterms® 2020 behielt die Mindestdeckung (ICC C) für CIF bei – anders als CIP, das auf Allrisikodeckung (ICC A) aufgewertet wurde. Das Risiko geht weiterhin auf den Käufer über, wenn die Ware am Verschiffungshafen an Bord ist.',
    descriptionES:
      'Como CFR, el vendedor paga el flete hasta el puerto de destino, pero también proporciona un seguro marítimo mínimo (Institute Cargo Clauses C) para el riesgo del comprador durante el viaje principal. Nota: Incoterms® 2020 mantuvo la cobertura mínima (ICC C) para CIF, a diferencia de CIP que fue actualizado a todo riesgo (ICC A). El riesgo aún se transfiere al comprador cuando las mercancías están a bordo en el puerto de embarque.',
    mode: 'sea',
    transferPoint: 'On Board Vessel (Risk) / Destination Port (Cost & Min. Insurance)',
    riskTransferStep: 2,
    costTransferStep: 3,
    responsibilities: {
      exportClearance: 'Seller',
      loadingAtOrigin: 'Seller',
      mainCarriage: 'Seller',
      insurance: 'Seller',
      unloadingAtDestination: 'Buyer',
      importClearance: 'Buyer',
    },
  },
] as const;

// ─────────────────────────────────────────────────────────────────────────────
// Derived helpers
// ─────────────────────────────────────────────────────────────────────────────

export const INCOTERMS_ANY_MODE = INCOTERMS.filter((t) => t.mode === 'any');
export const INCOTERMS_SEA_ONLY = INCOTERMS.filter((t) => t.mode === 'sea');

/** Returns true when risk and cost transfer at different steps (split incoterms) */
export function hasSplitTransfer(incoterm: Incoterm): boolean {
  return incoterm.riskTransferStep !== incoterm.costTransferStep;
}
