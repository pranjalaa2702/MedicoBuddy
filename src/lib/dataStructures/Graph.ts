export class DrugNode {
  id: string;
  name: string;
  category: string;
  dosageRange: { min: number; max: number };
  contraindications: string[];

  constructor(
    id: string,
    name: string,
    category: string,
    dosageRange: { min: number; max: number },
    contraindications: string[] = []
  ) {
    this.id = id;
    this.name = name;
    this.category = category;
    this.dosageRange = dosageRange;
    this.contraindications = contraindications;
  }
}

export class DrugInteraction {
  severity: number; // 0-10, where 10 is most severe
  description: string;
  recommendations: string[];

  constructor(severity: number, description: string, recommendations: string[] = []) {
    this.severity = severity;
    this.description = description;
    this.recommendations = recommendations;
  }
}

export class DrugInteractionGraph {
  nodes: Map<string, DrugNode>;
  adjacencyList: Map<string, Map<string, DrugInteraction>>;

  constructor() {
    this.nodes = new Map();
    this.adjacencyList = new Map();
  }

  addDrug(drug: DrugNode): void {
    this.nodes.set(drug.id, drug);
    if (!this.adjacencyList.has(drug.id)) {
      this.adjacencyList.set(drug.id, new Map());
    }
  }

  addInteraction(
    drug1Id: string,
    drug2Id: string,
    interaction: DrugInteraction
  ): void {
    if (!this.nodes.has(drug1Id) || !this.nodes.has(drug2Id)) {
      throw new Error('Drug not found in graph');
    }

    this.adjacencyList.get(drug1Id)!.set(drug2Id, interaction);
    this.adjacencyList.get(drug2Id)!.set(drug1Id, interaction);
  }

  findInteractions(drugId: string): Map<string, DrugInteraction> {
    return this.adjacencyList.get(drugId) || new Map();
  }

  findRiskPath(startDrugId: string, endDrugId: string): {
    path: string[];
    totalRisk: number;
    interactions: DrugInteraction[];
  } {
    const distances = new Map<string, number>();
    const previous = new Map<string, string>();
    const unvisited = new Set<string>();

    // Initialize distances
    this.nodes.forEach((_, id) => {
      distances.set(id, id === startDrugId ? 0 : Infinity);
      unvisited.add(id);
    });

    while (unvisited.size > 0) {
      // Find minimum distance node
      let minDistance = Infinity;
      let current = '';
      unvisited.forEach(id => {
        const distance = distances.get(id)!;
        if (distance < minDistance) {
          minDistance = distance;
          current = id;
        }
      });

      if (current === endDrugId) break;
      if (current === '') break;

      unvisited.delete(current);

      // Update distances to neighbors
      const neighbors = this.adjacencyList.get(current)!;
      neighbors.forEach((interaction, neighborId) => {
        if (unvisited.has(neighborId)) {
          const newDistance = distances.get(current)! + interaction.severity;
          if (newDistance < distances.get(neighborId)!) {
            distances.set(neighborId, newDistance);
            previous.set(neighborId, current);
          }
        }
      });
    }

    // Reconstruct path
    const path: string[] = [];
    const interactions: DrugInteraction[] = [];
    let current = endDrugId;

    while (previous.has(current)) {
      path.unshift(current);
      const prev = previous.get(current)!;
      interactions.unshift(this.adjacencyList.get(prev)!.get(current)!);
      current = prev;
    }
    path.unshift(startDrugId);

    return {
      path,
      totalRisk: distances.get(endDrugId)!,
      interactions
    };
  }
}