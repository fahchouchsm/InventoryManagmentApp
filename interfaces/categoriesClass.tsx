import mainCategories from "../data/mainCategories.json";

export interface SubCategorieInt {
  name: string | null;
  subId: number | null;
}

export interface MainCategorieInt {
  mainCatid: number | null;
  catName: string | null;

  getIdNumber(
    mainCatName: string | null,
    data: { id: number; name: string; subId?: number }[]
  ): number;

  assignSubCatIds(subCategories: SubCategorieInt[]): SubCategorieInt[];
}

export default class MainCategorie implements MainCategorieInt {
  mainCatid: number | null = null;
  catName: string | null = null;
  subCategories: SubCategorieInt[] = [];

  getIdNumber(
    mainCatName: string | null,
    data: { id: number; name: string; subId?: number }[]
  ): number {
    if (mainCatName) {
      const result = data.find(
        (mainCategorie) =>
          mainCategorie.name.toLowerCase().trim() ===
          mainCatName.toLowerCase().trim()
      )?.id;

      if (result !== undefined) {
        return result;
      }
    }

    throw new Error("Main Category Id Not Found");
  }

  assignSubCatIds(subCategories: SubCategorieInt[]): SubCategorieInt[] {
    return subCategories.map((subCat) => {
      if (subCat.subId === null && subCat.name) {
        const foundSubCat = mainCategories.find(
          (category) =>
            category.name.toLowerCase() === subCat.name?.toLowerCase()
        );

        if (foundSubCat) {
          return { ...subCat, subId: foundSubCat.id };
        } else {
          throw new Error(`Subcategory Id Not Found for ${subCat.name}`);
        }
      }
      return subCat;
    });
  }

  constructor(
    mainCatId: number | null,
    mainCatName: string | null,
    subCatIds: SubCategorieInt[]
  ) {
    if (mainCatId !== null) {
      this.mainCatid = mainCatId;
    } else if (mainCatName) {
      this.mainCatid = this.getIdNumber(mainCatName, mainCategories);
    } else {
      throw new Error("Main Category ID or Name is required");
    }

    this.catName = mainCatName;
    this.subCategories = this.assignSubCatIds(subCatIds);
  }
}
