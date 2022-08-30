const aantalDobbelstenen = 5;
const maxAantalOgen = 6;
const maxBeurten = 13;
class dice {
  constructor(maxAantalOgen) {
    this.maxAantalOgen = maxAantalOgen;
    this.locked = false;
  }
  roll() {
    if (!this.locked) {
      const ogen = Math.ceil(Math.random() * this.maxAantalOgen);
      this.aantalOgen = ogen;
    }
  }
  teken(id) {
    const img = document.createElement("img");
    const veld = document.getElementById("veld");
    img.src = `img/${this.aantalOgen}.png`;
    img.classList.add("col");
    img.classList.add("dice");
    img.classList.add(`steen${id}`);
    if (this.locked) {
      img.classList.add("locked");
    } else {
      img.addEventListener("click", () => {
        if (this.locked) {
          this.unlock(`steen${id}`);
        } else {
          this.lock(`steen${id}`);
        }
      });
    }
    veld.appendChild(img);
  }
  setOgen(aantal) {
    this.aantalOgen = aantal;
  }
  lock(id) {
    this.locked = true;
    document.getElementsByClassName(id)[0].classList.add("locked");
  }
  unlock(id) {
    this.locked = false;
    if (id) {
      document.getElementsByClassName(id)[0].classList.remove("locked");
    }
  }
}
// end class dice
// --------------------
class game {
  constructor() {
    this.poging = 1;
    this.beurt = 1;
    this.dobbelstenen = [];
    for (let i = 1; i <= aantalDobbelstenen; i++) {
      this.dobbelstenen.push(new dice(maxAantalOgen));
    }
    this.verwerk();
    this.scores = {
      ones: 0,
      tows: 0,
      threes: 0,
      fours: 0,
      fives: 0,
      sixes: 0,
      subtotal: 0,
      bonus: 0,
      threeofkind: 0,
      fourofkind: 0,
      fullHouse: 0,
      smallStraight: 0,
      largeStraight: 0,
      chance: 0,
      yahtzee: 0,
      total: 0,
    };
    this.info();
    this.toonMogelijkeScore();
  }
  info() {
    document.getElementById(
      "info"
    ).innerText = `dit is poging ${this.poging}, beurt ${this.beurt}`;
  }
  alert(text) {
    const bericht = document.getElementById("alert");
    bericht.classList.add("alert");
    bericht.classList.add("alert-danger");
    bericht.innerText = text;
  }
  verwijder() {
    const veld = document.getElementById("veld");
    while (veld.lastChild) {
      veld.removeChild(veld.lastChild);
    }
  }
  verwerk(unlock) {
    this.verwijder();
    const newDobbelstenen = [];
    this.dobbelstenen.forEach((steen, index) => {
      if (unlock) {
        steen.unlock();
      }
      steen.roll();
      steen.teken(index);
      newDobbelstenen.push(steen);
    });
    this.dobbelstenen = newDobbelstenen;
    this.info();
  }
  volgende(gescoord) {
    if (this.beurt < maxBeurten) {
      if (gescoord) {
        const alert = document.getElementById("alert");
        alert.classList.remove("alert");
        alert.classList.remove("alert-danger");
        alert.innerText = "";
        this.scoreNodig = false;
        this.poging = 3;
      }
      if (!this.scoreNodig) {
        if (this.poging < 3) {
          this.poging++;
          this.verwerk();
          if (this.poging === 3) {
            this.scoreNodig = true;
          }
        } else {
          this.beurt++;
          this.poging = 1;
          this.verwerk(true);
        }
        this.toonMogelijkeScore();
      } else {
        this.alert(
          "je kan niet verdergaan. gelieve eerst je punten in te vullen"
        );
      }
    } else {
      this.alert(`game over. je totale score is ${this.scores["total"]}`);
    }
  }
  // scores
  toonMogelijkeScore() {
    // geef vastgezette scores weer
    for (const key in this.scores) {
      if (this.scores.hasOwnProperty.call(this.scores, key)) {
        const element = this.scores[key];
        let tag = document.getElementById(key);
        tag.innerHTML = element;
        if (!["total", "subtotal", "bonus"].includes(key)) {
          if (tag.classList.length === 0) {
            // verwijder vorige element plaats nieuw (wis events)
            const clone = tag.cloneNode(true);
            const parent = tag.parentElement;
            parent.removeChild(tag);
            parent.appendChild(clone);
            tag = document.getElementById(key);
            tag.addEventListener(
              "click",
              () => {
                this.scores[key] = parseInt(tag.innerText);
                tag.classList.add("locked");
                this.toonMogelijkeScore();
                this.volgende(true);
              },
              { once: true }
            );
          }
        }
      }
    }
    // einde vastgezette scores
    // bereken geworpen aantal ogen * ogen
    const scores = Object.keys(this.scores).slice(0, 6);
    const geworpen = this.gegooideStenen();
    scores.forEach((element, index) => {
      if (this.scores[element] === 0) {
        //als ik nog geen score heb vastgezet
        document.getElementById(element).innerHTML =
          geworpen[index] * (index + 1);
      }
    });
    // einde aantal ogen
    // bereken subtotaal
    let subtotaal = 0;
    Object.values(this.scores)
      .slice(0, 6)
      .forEach((value) => {
        subtotaal += value;
      });
    this.scores["subtotal"] = subtotaal;
    document.getElementById("subtotal").innerText = subtotaal;
    // einde bereken subtotaal
    // bonus
    if (subtotaal >= 63) {
      this.scores["bonus"] = 35;
      document.getElementById("bonus").innerText = 35;
    }
    // einde bonus
    // bereken poker scores
    let score = 0;
    let duo = false;
    let threeofkind = false;
    let fourofkind = false;
    let yahtzee = false;
    geworpen.forEach((element, index) => {
      if (element === 2) {
        duo = true;
      }
      if (element >= 3) {
        threeofkind = true;
      }
      if (element >= 4) {
        fourofkind = true;
      }
      if (element === 5) {
        yahtzee = true;
      }
      score += element * (index + 1);
    });
    if (threeofkind) {
      if (this.scores["threeofkind"] === 0) {
        document.getElementById("threeofkind").innerText = score;
      }
    }
    if (fourofkind) {
      if (this.scores["fourofkind"] === 0) {
        document.getElementById("fourofkind").innerText = score;
      }
    }
    if (yahtzee) {
      if (this.scores["yahtzee"] === 0) {
        document.getElementById("yahtzee").innerText = 50;
      }
    }
    if (score === 20) {
      if (this.scores["chance"] === 0) {
        document.getElementById("chance").innerText = 20;
      }
    }
    if (duo && threeofkind) {
      if (this.scores["fullHouse"] === 0) {
        document.getElementById("fullHouse").innerText = 25;
      }
    }
    // einde poker scores
    // straten
    const aantalStenen = geworpen.filter((x) => x !== 0).length;
    if (aantalStenen >= 4) {
      const rij = [];
      let opEenRij = 0;
      geworpen.forEach((element, index) => {
        if (element > 0) {
          opEenRij++;
        } else {
          opEenRij = 0;
        }
        rij.push(opEenRij);
      });
      const maxOpeenvolgende = Math.max(...rij);
      if (maxOpeenvolgende >= 4) {
        if (this.scores["smallStraight"] === 0) {
          document.getElementById("smallStraight").innerText = 30;
        }
      }
      if (maxOpeenvolgende >= 5) {
        if (this.scores["largeStraight"] === 0) {
          document.getElementById("largeStraight").innerText = 40;
        }
      }
    }
    geworpen.filter((x) => x !== 0).length;
    // einde straten
    // bereken totaal
    let totaal = 0;
    Object.values(this.scores)
      .slice(6, -1)
      .forEach((value) => {
        totaal += value;
      });
    this.scores["total"] = totaal;
    document.getElementById("total").innerText = totaal;

    // eine bereken totaal
  }
  gegooideStenen() {
    // aantallen
    const scores = [];
    this.dobbelstenen.forEach((steen) => {
      scores.push(steen.aantalOgen);
    });
    const geworpenAantalOgen = [];
    for (let i = 1; i <= maxAantalOgen; i++) {
      const count = scores.filter((x) => x === i).length;
      geworpenAantalOgen.push(count);
    }
    return geworpenAantalOgen;
    // einde aantallen
  }
}
// end class game
// ----------------------------
// algemene logica

const rollKnop = document.getElementById("rollKnop");
let spel = null;
rollKnop.addEventListener("click", function () {
  const aantalBestaandeStenen = document.getElementsByClassName("dice").length;
  if (aantalBestaandeStenen) {
    spel.volgende();
  } else {
    spel = new game();
  }
});
