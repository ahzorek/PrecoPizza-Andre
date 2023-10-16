document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM carregada")

  //apos carregar o DOM, inicializa o programa e suas definições
  const pizzas = []

  //ativa o campo necessario caso usuario queira calcular pizza retangular
  document.querySelector('Select[title="Formato da Pizza"]').addEventListener('change', e => {
    const type = e.target.value
    const pizzaSizeRectInput = document.querySelector('#pizzaSize__rect')
    if (type === 'retangular') {
      pizzaSizeRectInput.disabled = false
      pizzaSizeRectInput.required = true
      pizzaSizeRectInput.setAttribute('style', 'opacity: 1;')
      pizzaSizeRectInput.setAttribute('title', 'Comprimento da Pizza. Preencha este campo')

    } else {
      pizzaSizeRectInput.disabled = true
      pizzaSizeRectInput.required = false
      pizzaSizeRectInput.setAttribute('style', 'opacity: .2;')
      pizzaSizeRectInput.setAttribute('title', 'Ignore este campo')
    }
  })

  //recebe valores (nome, tamanho e preço das pizzas) e salva na memoria
  document.querySelector('#pizzaRegister').addEventListener('submit', event => {
    event.preventDefault()
    const nodes = Array.from(event.target)
    let pizza = {}
    nodes.forEach(node => {
      if (node.tagName !== 'BUTTON') {
        pizza = {
          ...pizza,
          [node.id]: node.value
        }
      }
    })

    //checa a existencia de nomes ou tamanhos repetidos, se true, trava a adição da nova pizza
    if (checkForDupedName(pizza)) {
      alert('nome está repetido')
      return
      //se nova pizza é unica, sao calculados valor da area da pizza e seu respectivo preco por area
      //nova pizza é adicionada a array pizzas
    } else {
      const pizzaArea = calcPizzaArea(pizzaFormat.value, pizzaSize.value, pizzaSize__rect.value)
      const absolutePrice = pizza.pizzaPrice / pizzaArea
      pizzas.push({
        ...pizza,
        pizzaArea,
        absolutePrice
      })
    }

    //adiciona informação de quantas pizzas foram adicionadas a base de calculo
    const messageOutput = pizzas.length > 1 ? 'pizzas adicionadas.' : 'pizza adicionada.'
    document.querySelector('#pizzasAdded').value = `${pizzas.length} ${messageOutput}`

    //se array pizza tem mais de 2 itens, é possivel realizar uma comparação, botao é habilitado
    if (pizzas.length > 1) {
      document.querySelector('#comparePizzas').setAttribute('style', 'display: block;')
    }

    //limpa os campos e retorna o foco ao campo inicial para que mais entradas sejam feitas
    nodes.forEach(node => node.value = '')
    event.target[0].focus()
  })

  //verifica se nome do tamanho de pizza ainda não foi usado
  function checkForDupedName(newPizza) {
    return pizzas.some(({ pizzaName }) => newPizza.pizzaName === pizzaName)
  }

  // //verifica se o tamanho de pizza ainda não foi usado
  // function checkForDupedSize(newPizza) {
  //   return pizzas.some(({ pizzaSize }) => newPizza.pizzaName === pizzaSize)
  // }


  //verifica a diferença de valor percentual (em relação ao melhor valor)
  function getDiffPercent(bestPrice, comparingValue) {
    const diff = ((comparingValue - bestPrice) / bestPrice) * 100
    return diff
  }

  //calcula area da pizza baseado em qual formato ela tem
  function calcPizzaArea(format, sideA, sideB) {
    console.log(format, sideA, sideB)
    if (format === 'circular') {
      return Math.PI * ((sideA / 2) * (sideA / 2))
    }
    else if (format === 'quadrada') {
      return sideA * sideA
    }
    else if (format === 'retangular' && sideB) {
      return sideA * sideB
    }
    else
      console.error('problema com params')
  }

  //ordenas as pizzas por valor absoluto, realiza o calculo e cria a array de pizzas com valores relativos (ordenadas a partir do 'melhor valor')
  document.querySelector('#comparePizzas').addEventListener('click', () => {
    const pizzasSortedByPrice = sort(pizzas)
    const bestPrice = pizzasSortedByPrice[0]
    const pizzasWithRelativePrice = []
    pizzasSortedByPrice.forEach((pizza, index) => {
      if (index === 0) {
        pizzasWithRelativePrice.push({
          ...pizza,
          relativePrice: 'Melhor preço'
        })
      } else {
        pizzasWithRelativePrice.push({
          ...pizza,
          relativePrice: getDiffPercent(bestPrice.absolutePrice, pizza.absolutePrice).toFixed(2)
        })
      }
    })

    console.table(pizzasWithRelativePrice)
    printValuesToScreen(pizzasWithRelativePrice)
  })

  const currencyOptions = {
    style: 'currency',
    currency: 'BRL',
    currencyDisplay: 'symbol',
  }

  //imprime os resultados para tela
  function printValuesToScreen(table) {
    const tableOutput = document.querySelector('#tableOutput')
    tableOutput.innerHTML = ''
    table.forEach(({ pizzaName, pizzaFormat, pizzaSize, pizzaSize__rect, pizzaPrice, absolutePrice, relativePrice }) => {
      const formattedPizzaSize = pizzaFormat === 'retangular' ? pizzaSize + 'x' + pizzaSize__rect + 'cm' : pizzaSize + 'cm'
      const formattedFullPrice = new Intl.NumberFormat('pt-BR', currencyOptions).format(pizzaPrice)
      const formattedAbsolutePrice = new Intl.NumberFormat('pt-BR', currencyOptions).format(absolutePrice)
      const formattedRelativePrice = relativePrice === 'Melhor preço' ? relativePrice : `+${relativePrice}%`
      const newRow = document.createElement('tr')
      newRow.setAttribute('class', 'bg-white border-b dark:bg-stone-800 dark:border-stone-700')
      newRow.innerHTML = `
            <th scope="row" class="px-6 py-4 font-medium text-stone-900 whitespace-nowrap dark:text-white">
              ${pizzaName}
            </th>
            <td class="px-6 py-4">
              ${formattedPizzaSize}
            </td>
            <td class="px-6 py-4">
              ${formattedFullPrice}
            </td>
            <td class="px-6 py-4">
              ${formattedAbsolutePrice}
            </td>
            <td class="px-6 py-4">
              ${formattedRelativePrice}
            </td>
          `
      tableOutput.appendChild(newRow)
    })
    document.querySelector('#tableWrapper').setAttribute('style', 'display: block;')
  }

  //ordena array de pizzas pelo menor valor (preco/cm2)
  function sort(arr) {
    const size = arr.length
    let itemTrocado
    do {
      itemTrocado = false
      for (let i = 0; i < size - 1; i++) {
        if (arr[i].absolutePrice > arr[i + 1].absolutePrice) {
          const temp = arr[i]
          arr[i] = arr[i + 1]
          arr[i + 1] = temp
          itemTrocado = true
        }
      }
    } while (itemTrocado)

    return arr
  }
})
