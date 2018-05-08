export default class Cell {
  constructor(name) {
    this.name = name;
    this.value = 5;
    this.edges = [];
    this.searched = false;
    this.parent = null;
  }

  reportEdges() {
    console.log(this.edges);
  }
}
