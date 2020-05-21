const selectGen = document.querySelector("select[name=gen]");
const selectType = document.querySelector("select[name=type]");
const searchPoke = document.querySelector("input[name=search]");
const pokeWrapper = document.querySelector(".pokemons-wrapper");
const pokeDetails = document.querySelector("#main");
const pokeBall = document.querySelector(".load-anim img");

class pokemon_DATA {
  constructor(offset, limit) {
    this.offset = offset;
    this.limit = limit;
    this.endpoint = `https://pokeapi.co/api/v2/pokemon/?offset=${this.offset}&limit=${this.limit}`;
    this.pokemon_data;
  }
  fetch_data(endpoint) {
    anim_LOADING(pokeBall);
    return fetch(endpoint)
      .then((res) => res.json())
      .then((data) => {
        anim_STOP(pokeBall);
        return data;
      })
      .catch((err) => {
        anim_STOP(pokeBall);
        console.log(err);
      });
  }
  filter_TYPE(data, type) {
    return type === ""
      ? data
      : data.filter((x) => x.types.map((x) => x.type.name).includes(type));
  }
  search_POKE(data, name) {
    const regex = new RegExp(name, "gi");
    return data.filter((poke) => {
      return poke.name.match(regex);
    });
  }
  render_POKEMON(data) {
    return `
      <div class="pokemon-wrapper">
        <div class="pokemon-img">
          <img
            src="https://assets.pokemon.com/assets/cms2/img/pokedex/full/${fix_ID(
              data.id.toString()
            )}.png"
            alt="${data.name}"
            data-id="${data.id}"
            data-name="${data.name}"
            data-species="https://pokeapi.co/api/v2/pokemon-species/${data.id}/"
            data-poke="https://pokeapi.co/api/v2/pokemon/${data.id}/"
            data-trigger="true"
          />
        </div>
        <div class="pokemon-name">
          <h5>#${fix_ID(data.id.toString())}</h5>
          <h5 class="bold capitalize">${fix_NAME(data.name)}</h5>
        </div>
      </div>
    `;
  }
}

const gen_01 = new pokemon_DATA(0, 151);
const gen_02 = new pokemon_DATA(151, 100);
const gen_03 = new pokemon_DATA(251, 135);
const gen_04 = new pokemon_DATA(386, 107);
const gen_05 = new pokemon_DATA(493, 156);
const gen_06 = new pokemon_DATA(649, 72);
const gen_07 = new pokemon_DATA(721, 86);
const all_gen = new pokemon_DATA(0, 807);

// todo first landing page
controlFlow_GEN(selectGen.value);

// todo select change listener
selectGen.addEventListener("change", (e) => {
  const select_val = e.target.value;
  controlFlow_GEN(select_val);
});

// todo click details event listener
document.body.addEventListener("click", show_details);

function controlFlow_GEN(gen) {
  const gen_value = gen;
  switch (gen_value) {
    case "allgen":
      show(all_gen);
      break;
    case "gen01":
      show(gen_01);
      break;
    case "gen02":
      show(gen_02);
      break;
    case "gen03":
      show(gen_03);
      break;
    case "gen04":
      show(gen_04);
      break;
    case "gen05":
      show(gen_05);
      break;
    case "gen06":
      show(gen_06);
      break;
    case "gen07":
      show(gen_07);
      break;
    default:
      console.log("error");
      break;
  }
}

async function show(gen) {
  const {
    filter_TYPE,
    search_POKE,
    render_POKEMON,
    fetch_data,
    endpoint,
  } = gen;

  const raw_data = await fetch_data(endpoint);
  const data_poke = await Promise.all(
    raw_data.results.map((x) => {
      return fetch_data(x.url);
    })
  );

  let render = "";
  let data_rendered;
  data_rendered = data_poke;
  data_rendered.forEach((x) => {
    const rendered = render_POKEMON(x);
    render += rendered;
  });

  pokeWrapper.innerHTML = render;

  // todo filter
  selectType.addEventListener("change", (e) => {
    let renderFilter = "";
    const type = e.target.value;
    const filtered = filter_TYPE(data_poke, type);
    data_rendered = filtered;
    data_rendered.forEach((x) => {
      const rendered = render_POKEMON(x);
      renderFilter += rendered;
    });
    pokeWrapper.innerHTML = renderFilter;
  });

  // todo search
  searchPoke.addEventListener("input", (e) => {
    let renderSearch = "";
    const input = e.target.value;
    const search = search_POKE(data_rendered, input);
    search.forEach((x) => {
      const rendered = render_POKEMON(x);
      renderSearch += rendered;
    });
    pokeWrapper.innerHTML = renderSearch;
  });
}

async function show_details(e) {
  if (e.target.dataset.trigger) {
    const data_poke = await fetching(e.target.dataset.poke);
    const data_species = await fetching(e.target.dataset.species);
    const render = render_DETAILS(data_poke, data_species);
    pokeDetails.innerHTML = render;
  }
}

// ! RENDER FUNCTION
function render_DETAILS(dataPoke, dataSpecies) {
  let data_TYPE = "";
  dataPoke.types.forEach((x) => {
    const type = show_TYPE(x);
    data_TYPE += type;
  });

  let data_STAT = "";
  dataPoke.stats.forEach((x) => {
    const stat = show_STAT(x);
    data_STAT += stat;
  });

  let data_ABILITY = "";
  dataPoke.abilities.forEach((x) => {
    const ability = show_ABILITY(x);
    data_ABILITY += ability;
  });

  let genera = filter_GENUS(dataSpecies.genera);
  let [genus_en] = genera;

  let flavor_TXT = show_FLAVOR(dataSpecies["flavor_text_entries"]);
  let [flavor_en] = flavor_TXT;

  let name = show_NAME(dataSpecies.names);
  let [name_en] = name;

  return `
  <div class="details-wrapper">
    <div class="pokemon-card">
      <div class="img-wrapper">
        <img
          src="https://assets.pokemon.com/assets/cms2/img/pokedex/full/${fix_ID(
            dataPoke.id.toString()
          )}.png"
          alt="${dataPoke.name}"
        />
      </div>
      <div class="card-text">
        <div class="head-card-text">
          <h5>
            <span class="text-medium bold">No.${fix_ID(
              dataPoke.id.toString()
            )}</span> <br />
            <span class="text-large bold">${name_en.name}</span> <br />
            <span class="text-small">${genus_en.genus}</span>
          </h5>
        </div>
        <div class="type-card-text">
          <h5>
            <span class="text-small bold">Type :</span> <br />
            ${data_TYPE}
          </h5>
        </div>
        <div class="h-card-text">
          <h5 class="height">
            <span class="text-small bold">Height</span> <br />
            <span class="text-small">${change_FEET_INCHES(
              dataPoke.height
            )}</span>
          </h5>
        </div>
        <div class="w-card-text">
          <h5 class="weight">
            <span class="text-small bold">Weight</span> <br />
            <span class="text-small">${change_POUNDS(
              dataPoke.weight
            )} lbs</span>
          </h5>
        </div>
      </div>
    </div>
    <div class="pokemon-flavor-text">
      <p class="text-medium">
        "${flavor_en["flavor_text"]}"
      </p>
    </div>
    <div class="pokemon-stats">
      <div class="stats">
        <h5 class="text-small bold">
          Stats
        </h5>
        ${data_STAT}
      </div>
      <div class="abilities">
        <h5 class="text-small bold">Abilities</h5>
        ${data_ABILITY}
      </div>
      <div class="base-happiness">
        <h5 class="text-small bold">Base Happiness</h5>
        <p class="text-small">${dataSpecies["base_happiness"]}</p>
      </div>
      <div class="capture-rate">
        <h5 class="text-small bold">Capture Rate</h5>
        <p class="text-small">${dataSpecies["capture_rate"]}</p>
      </div>
      <div class="growth-rate">
        <h5 class="text-small bold">Growth Rate</h5>
        <p class="text-small capitalize">${dataSpecies["growth_rate"].name}</p>
      </div>
      ${show_HABITAT(dataSpecies.habitat)}
      ${show_EVOL_FROM(dataSpecies)}
    </div>
  </div>
  `;
}

// ! TOOL FUNCTION
function fetching(url) {
  anim_LOADING(pokeBall);
  return fetch(url)
    .then((res) => res.json())
    .then((data) => {
      anim_STOP(pokeBall);
      return data;
    })
    .catch((err) => {
      anim_STOP(pokeBall);
      console.log(err);
    });
}

function fix_ID(nums) {
  return nums.length == 1 ? `00${nums}` : nums.length == 2 ? `0${nums}` : nums;
}

function change_FEET_INCHES(n) {
  const toMetre = n * 10;
  const realFeet = (toMetre * 0.3937) / 12;
  const feet = Math.floor(realFeet);
  const inches = Math.round((realFeet - feet) * 12);
  function inches_FIX() {
    return inches.toString().length === 1 ? `0${inches}` : inches;
  }
  return `${feet}' ${inches_FIX(inches)}"`;
}

function change_POUNDS(n) {
  const pounds = n / 4.536;
  return pounds.toFixed(1);
}

function show_EVOL_FROM(data) {
  return data["evolves_from_species"] == null
    ? ""
    : `
    <div class="evol-from-species">
    <h5 class="text-small bold">Evolution from</h5>
      <p class="text-small capitalize">${data["evolves_from_species"].name}</p>
    </div>
    `;
}

function show_STAT(data) {
  function ifHP(data) {
    return data.stat.name !== "hp" ? "capitalize" : "uppercase";
  }
  return `
  <p class= "text-small ${ifHP(data)}">${data.stat.name} : ${
    data["base_stat"]
  }</p>
  `;
}

function show_TYPE(data) {
  return `
  <span class="type-box text-small bold capitalize" style="background-color: var(--${
    data.type.name
  }); ${change_WHITE(data)}">${data.type.name}</span> 
  `;
}

function change_WHITE(data) {
  const y = data.type.name;
  return y == "poison" ||
    y == "fighting" ||
    y == "ghost" ||
    y == "water" ||
    y == "psychic" ||
    y == "dragon"
    ? "color: white;"
    : "";
}

function show_ABILITY(data) {
  return `
  <p class="text-small capitalize">${data.ability.name}</p>
  `;
}

function filter_GENUS(data) {
  return data.filter((x) => {
    return x.language.name == "en";
  });
}

function show_FLAVOR(data) {
  return data.filter((x) => {
    return x.language.name == "en";
  });
}

function show_HABITAT(data) {
  return data === null
    ? ""
    : `<div class="habitat">
        <h5 class="text-small bold">Habitat</h5>
        <p class="text-small capitalize">${data.name}</p>
      </div>`;
}

function show_NAME(data) {
  const name = data.filter((x) => x.language.name.includes("en"));
  return name;
}

function fix_NAME(data) {
  return data == "nidoran-m"
    ? `Nidoran ♂	`
    : data == "nidoran-f"
    ? `Nidoran ♀`
    : data == "mr-mime"
    ? "Mr. Mime"
    : data == "deoxys-normal"
    ? "Deoxys"
    : data == "wormadam-plant"
    ? "Wormadam"
    : data == "giratina-altered"
    ? "Giratina"
    : data == "shaymin-land"
    ? "Shaymin"
    : data == "basculin-red-striped"
    ? "Basculin"
    : data == "darmanitan-standard"
    ? "Darmanitan"
    : data == "tornadus-incarnate"
    ? "Tornadus"
    : data == "thundurus-incarnate"
    ? "Thundurus"
    : data == "landorus-incarnate"
    ? "Landorus"
    : data == "keldeo-ordinary"
    ? "Keldeo"
    : data == "meloetta-aria"
    ? "Meloetta"
    : data == "meowstic-male"
    ? "Meowstic"
    : data == "aegislash-shield"
    ? "Aegislash"
    : data == "pumpkaboo-average"
    ? "Pumpkaboo"
    : data == "gourgeist-average"
    ? "Gourgeist"
    : data == "type-null"
    ? "Type: Null"
    : data == "minior-red-meteor"
    ? "Minior"
    : data == "mimikyu-disguised"
    ? "Mimikyu"
    : data == "tapu-koko"
    ? "Tapu Koko"
    : data == "tapu-lele"
    ? "Tapu Lele"
    : data == "tapu-bulu"
    ? "Tapu Bulu"
    : data == "tapu-fini"
    ? "Tapu Fini"
    : data;
}

function anim_LOADING(data) {
  anime({
    targets: pokeBall,
    rotate: 360,
    duration: 1200,
    loop: true,
    direction: "alternate",
  });
}

function anim_STOP(data) {
  anime({
    targets: pokeBall,
    rotate: 360,
    duration: 1200,
    direction: "alternate",
  });
}
