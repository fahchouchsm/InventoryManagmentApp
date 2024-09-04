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
  id: number;
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
  /**
   *
   * @param id
   * @param name
   * @param quantityAvailable
   * @param mainCatId
   * @param mainCatName
   * @param subCategories
   */
  constructor(
    id: number,
    name: string,
    quantityAvailable: number,
    mainCatId: number | null,
    mainCatName: string | null,
    subCategories: SubCategorieInt[]
  ) {
    // Ensure that at least a main category is provided
    if (!mainCatId && !mainCatName) {
      throw new Error("A main category ID or name must be provided");
    }
    super(mainCatId, mainCatName, subCategories);
    this.id = id;
    this.name = name;
    this.quantityAvailable = quantityAvailable;
    this.addingDate = new Date();
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
      } else {
        throw new Error("Error creating & locating ExternalDirectoryPath...");
      }
      return 0;
    } catch (error) {
      console.log(error);
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
