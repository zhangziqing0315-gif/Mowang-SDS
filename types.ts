export type Vector3 = [number, number, number];

export interface TreeTierProps {
  position: Vector3;
  scale: Vector3;
  rotationSpeed: number;
  isAssembled: boolean;
  scatterPosition: Vector3;
  scatterRotation: Vector3;
}

export interface OrnamentProps {
  position: Vector3;
  color: string;
  size?: number;
}

export interface SceneProps {
  assembled: boolean;
}
