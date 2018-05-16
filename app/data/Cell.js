export default class Cell {
  constructor(name) {
    this.name = name;
    this.value = 5;
    this.imageKey = 0;
    this.humanEdges = [];
    this.monsterEdges = [];
    this.searched = false;
    this.parent = null;
    this.isHighlighted = false;
    this.isRevealed = false;
    this.hasHuman = false;
    this.hasMonster = false;
    this.hasCache = false;
  }
}
