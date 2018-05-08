export default class Cell {
  constructor(name) {
    this.name = name;
    this.value = 5;
    this.humanEdges = [];
    this.monsterEdges = [];
    this.searched = false;
    this.parent = null;
    this.highlighted = false;
  }

  reportEdges() {
    console.log(this.edges);
  }
}
