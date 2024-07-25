import { LitElement, PropertyValueMap, html } from "lit";
import { customElement, property, query } from "lit/decorators.js";

/**
 * An example element.
 *
 * @slot - This element has a slot
 * @csspart button - The button
 */
@customElement("draw-venn")
export class VennElement extends LitElement {
  @query("#canvas2")
  canvas!: HTMLCanvasElement;

  @property()
  value!: string;

  ctx: CanvasRenderingContext2D | null = null;

  predicate: any = null;

  render() {
    return html` <canvas id="canvas2"></canvas> `;
  }

  paths!: Path2D[];
  size: number;
  margin: number;
  centers: number[] = [];

  constructor() {
    super();
    this.size = 300;
    this.margin = 20;

    const { size, margin } = this;

    const radius = (size - 2 * margin * 2) / 4;
    const title = 20;

    let p1 = new Path2D();
    const xFirst = margin + 2 * radius;
    this.centers.push(margin * 2 + radius, margin * 2 + radius);
    this.centers.push(margin * 2 + radius * 3, margin * 2 + radius);
    this.centers.push(margin * 2 + radius * 2, margin * 1.5 + radius * 4);

    p1.arc(xFirst, xFirst + title, radius, 2 * Math.PI, 0, false);

    let p2 = new Path2D();
    p2.arc(xFirst + radius, xFirst + title, radius, 2 * Math.PI, 0, false);

    let p3 = new Path2D();
    p3.arc(
      xFirst + radius / 2,
      xFirst + radius / 2 + title,
      radius,
      2 * Math.PI,
      0,
      false
    );

    let p4 = new Path2D();
    p4.rect(margin, margin, size - margin, size - margin);

    this.paths = [p1, p2, p3, p4];
  }

  isPointInPath({ x, y }: { x: number; y: number }) {
    const pathContainment = this.paths
      .slice(0, 3)
      .map((p) => (this.ctx!!.isPointInPath(p, x, y) ? "1" : "0"))
      .join("");

    if (!this.predicate) {
      return false;
    }
    return this.predicate.some((v: any) => pathContainment.match(v));
  }

  firstUpdated() {
    console.log("apple", "A∩B∪C" == this.value, this.value);

    const canvas = this.canvas;
    this.ctx = this.canvas.getContext("2d");
    canvas.width = 300;
    canvas.height = 300;

    /*
  Associative property for the intersection of three sets:  (A∩B)∩C=A∩(B∩C)
  Associative property for the union of three sets:  A∪(B∪C)=(A∪B)∪C
  Distributive property for set intersection over set union:  A∩(B∪C)=(A∩B)∪(A∩C)
  Distributive property for set union over set intersection:  A∪(B∩C)=(A∪B)∩(A∪C)`
 .
    */
  }

  shouldUpdate(changedProperties: Map<string, any>) {
    console.log(changedProperties);

    // Only update element if prop1 changed.
    return changedProperties.has("value");
  }

  protected updated(
    _changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>
  ): void {
    if (!_changedProperties.has("value")) {
      return;
    }

    const mappings = [
      {
        command: "A∩B",
        predicate: [/11./],
      },
      {
        command: "(A∩B)-C",
        predicate: [/110/],
      },
      {
        command: "A∩C",
        predicate: [/1.1/],
      },
      {
        command: "A∪B",
        predicate: [/1../, /.1./],
      },
      {
        command: "A∪C",
        predicate: [/1../, /..1/],
      },
      {
        command: "A∩(B∪C)",
        predicate: [/111/, /110/, /101/],
      },
      {
        command: "B∪C",
        predicate: [/.1./, /..1/],
      },
      {
        command: "(A∪C)∩B",
        predicate: [/111/, /110/, /011/],
      },
      {
        command: "(A∩B)∪(A∩C)",
        predicate: [/111/, /110/, /101/],
      },
    ];

    this.predicate = mappings.find((v) => v.command == this.value)?.predicate;
    if (!this.ctx) {
      return;
    }

    const ctx = this.ctx;
    const imageData = this.ctx.getImageData(0, 0, 300, 300);

    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      const cell = i / 4;
      const pixelX = cell % imageData.height;
      const pixelY = Math.floor(cell / imageData.width);


      const isPointInPath = this.isPointInPath({ x: pixelX, y: pixelY });
      data[i] = isPointInPath ? 85 : 255; //red
      data[i + 1] = isPointInPath ? 114 : 255; // green
      data[i + 2] = isPointInPath ? 95 : 255; // blue
      data[i + 3] = 255;
    }

    ctx.imageSmoothingEnabled = true;

    ctx.putImageData(imageData, 0, 0);

    ctx.lineWidth = 2;
    ctx.strokeStyle = "#999";

    this.paths.forEach((p) => ctx.stroke(p));
    const text = ctx.measureText(this.value || "Select Expr Above"); // TextMetrics object

    ctx.font = "30px Ubuntu bold";
    ctx.fillStyle = this.value ? "green": "red";
    ctx.fillText(this.value || "Select Expr Above", this.size / 2 - text.width, this.margin * 3);

    const setNames = ["A", "B", "C"];
    this.paths.slice(0, 3).forEach((v, i) => {
      ctx.font = "15px Ubuntu";
      ctx.fillText(setNames[i], this.centers[i * 2], this.centers[i * 2 + 1]);
    });
  }
}

declare global {
  interface HTMLElementTagNameMap {
    venn: VennElement;
  }
}

