import MainCategorie, { SubCategorieInt } from "./categoriesClass";
import _ from "lodash";
import RNFS from "react-native-fs";

interface image {
  url: string;
  main: boolean;
}

export interface order {
  date: Date;
  pricePerUnit: number;
  quantity: number;
  readonly total: number;
}
/**
 *
 */
export default class Product extends MainCategorie {
  public id: number | null = null;
  name: string;
  quantityAvailable: number = 0;
  addingDate: Date;
  readonly total: number = 0;
  images: image[] = [];
  ordersHistory: {
    buying: order[];
    selling: order[];
  } = {
    buying: [],
    selling: [],
  };
  private constructor(
    name: string,
    quantityAvailable: number,
    mainCatId: number,
    subCategories: SubCategorieInt[]
  ) {
    super(mainCatId, subCategories);
    this.name = name;
    this.quantityAvailable = quantityAvailable;
    this.addingDate = new Date();
  }
  static async create(
    name: string,
    quantityAvailable: number,
    mainCatId: number,
    subCategories: SubCategorieInt[]
  ): Promise<Product> {
    const product = new Product(
      name,
      quantityAvailable,
      mainCatId,
      subCategories
    );
    product.id = await product.getLastIdNumber();
    return product;
  }

  isAvailable(): boolean {
    return this.quantityAvailable > 0;
  }

  async createAppFolderIfNeeded(folderPath: string): Promise<boolean> {
    try {
      const exist = await RNFS.exists(folderPath);
      if (exist) {
        console.log("folder exist");
      } else {
        RNFS.mkdir(folderPath);
      }
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  async getLastIdNumber(): Promise<number> {
    try {
      const directoryPath = `${RNFS.ExternalDirectoryPath}/StockManagmentApp`;
      if (await this.createAppFolderIfNeeded(directoryPath)) {
        const productsData = await RNFS.readFile(
          `${directoryPath}/productsData.json`
        );
        const parsedData = JSON.parse(productsData);

        if (Array.isArray(parsedData)) {
          return parsedData.length;
        } else {
          console.log("Invalid data format in productsData.json");
          return 0;
        }
      } else {
        throw new Error("Failed to create or access directory path.");
      }
    } catch (error) {
      console.log("Error in getLastIdNumber:", error);
      return 0;
    }
  }

  save(): boolean {
    return true;
  }

  addImage(img: image | image[]): void {
    Array.isArray(img) ? this.images.push(...img) : this.images.push(img);
  }

  removeImageIndex(i: number): void {
    this.images.splice(i, 1);
  }

  removeAllImages(): void {
    this.images = [];
  }

  getImages(): image[] {
    return this.images;
  }

  getOrdersIndex(i: number, type: "buying" | "selling"): order {
    const orders =
      type === "buying"
        ? this.ordersHistory.buying
        : this.ordersHistory.selling;
    if (i >= orders.length) {
      throw new Error("No matching order");
    }
    return orders[i];
  }

  getTotalOrdersNumber(): number {
    return [...this.ordersHistory.buying, ...this.ordersHistory.selling].length;
  }

  getAllorders(
    type: "date" | "pricePerUnit" | "quantity" | "total",
    order: "asc" | "desc"
  ): order[] {
    const allOrders = [
      ...this.ordersHistory.buying,
      ...this.ordersHistory.selling,
    ];
    return _.sortBy(allOrders, [type], [order]);
  }
  addOrder(
    pricePerUnit: number,
    quantity: number,
    type: "buying" | "selling"
  ): boolean {
    const total = quantity * pricePerUnit;
    const date = new Date();
    if (type == "buying") {
      this.ordersHistory.buying.push({ date, pricePerUnit, quantity, total });
      return true;
    } else if (type == "selling") {
      this.ordersHistory.selling.push({ date, pricePerUnit, quantity, total });
      return true;
    }
    return false;
  }
}
