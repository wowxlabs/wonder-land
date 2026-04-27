export interface PersonDef {
  id: string;
  label: string;
  model: string;
  texture: string;
}

export const TEXTURE = "/models/people/people_texture_map.png";

export const PEOPLE: PersonDef[] = [
  { id: "king",           label: "King",            model: "/models/people/king.fbx",            texture: TEXTURE },
  { id: "queen",          label: "Queen",           model: "/models/people/queen.fbx",           texture: TEXTURE },
  { id: "city_dwellers_1",label: "City Dweller 1",  model: "/models/people/city_dwellers_1.fbx", texture: TEXTURE },
  { id: "city_dwellers_2",label: "City Dweller 2",  model: "/models/people/city_dwellers_2.fbx", texture: TEXTURE },
  { id: "rich_citizens_1",label: "Rich Citizen 1",  model: "/models/people/rich_citizens_1.fbx", texture: TEXTURE },
  { id: "rich_citizens_2",label: "Rich Citizen 2",  model: "/models/people/rich_citizens_2.fbx", texture: TEXTURE },
  { id: "rich_citizens_3",label: "Rich Citizen 3",  model: "/models/people/rich_citizens_3.fbx", texture: TEXTURE },
  { id: "rich_citizens_4",label: "Rich Citizen 4",  model: "/models/people/rich_citizens_4.fbx", texture: TEXTURE },
  { id: "peasant_1",      label: "Peasant 1",       model: "/models/people/peasant_1.fbx",       texture: TEXTURE },
  { id: "peasant_2",      label: "Peasant 2",       model: "/models/people/peasant_2.fbx",       texture: TEXTURE },
  { id: "peasant_3",      label: "Peasant 3",       model: "/models/people/peasant_3.fbx",       texture: TEXTURE },
  { id: "peasant_4",      label: "Peasant 4",       model: "/models/people/peasant_4.fbx",       texture: TEXTURE },
  { id: "peasant_5",      label: "Peasant 5",       model: "/models/people/peasant_5.fbx",       texture: TEXTURE },
  { id: "peasant_6",      label: "Peasant 6",       model: "/models/people/peasant_6.fbx",       texture: TEXTURE },
];
