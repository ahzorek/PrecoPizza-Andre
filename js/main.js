document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM carregada")

  //apos carregar o DOM, inicializa o programa e suas definições
  const pizzas = []


  //cria dinamicamente os formatos de pizza possiveis. se eventualmente forem adicionados mais formatos, pode ser alterado diretamente nesta area do programa
  const formatos = ['Quadrada', 'Retangular', 'Circular']

  formatos.forEach(formato => {
    const formatoOption = document.createElement('option')
    formatoOption.innerText = formato
    formatoOption.value = formato.toLowerCase()
    document.querySelector('#pizzaFormat').appendChild(formatoOption)
  })

  //altera o comportamento do campo opcional de tamanho (valido para pizzas retangulares apenas)
  const pizzaSizeRectInput = document.querySelector('#pizzaSize__rect')

  function disableOptionalSizeInput(input) {
    input.removeAttribute('required')
    input.setAttribute('disabled', false)
    input.classList.replace('input-enabled', 'input-disabled')
  }

  function enableOptionalSizeInput(input) {
    input.removeAttribute('disabled')
    input.setAttribute('required', false)
    input.classList.replace('input-disabled', 'input-enabled')
  }
  ///////////////

  //ativa o campo necessario caso usuario queira calcular pizza retangular
  document.querySelector('Select[title="Formato da Pizza"]').addEventListener('change', e => {
    const type = e.target.value
    if (type === 'retangular') {
      enableOptionalSizeInput(pizzaSizeRectInput)
    } else {
      disableOptionalSizeInput(pizzaSizeRectInput)
    }
  })

  //recebe valores (nome, tamanho e preço das pizzas) e salva na memoria
  const pizzaRegisterForm = document.querySelector('#pizzaRegister')
  pizzaRegisterForm.addEventListener('submit', event => {
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

    //passa as informações mais recentes para a tela e atualiza a interface com possiveis novos botoes(ou remove)
    updateScreen()

    //limpa os campos e retorna o foco ao campo inicial para que mais entradas sejam feitas
    pizzaRegisterForm.reset()
    disableOptionalSizeInput(pizzaSizeRectInput)
    event.target[0].focus()
  })

  //verifica se nome do tamanho de pizza ainda não foi usado
  function checkForDupedName(newPizza) {
    return pizzas.some(({ pizzaName }) => newPizza.pizzaName === pizzaName)
  }

  //deleta ultimo item adicionado
  document.querySelector('#deleteLastPizza').addEventListener('click', e => {
    const confirm = window.confirm('Tem certeza que deseja apagar o último item?')
    if (pizzas.length > 1) {
      if (confirm) {
        pizzas.pop()
        updateScreen()
      }
    }
    else return
  })

  //deleta elemento especifico da array
  /////////////////////////////////////


  //atualiza informações para a tela
  function updateScreen() {
    if (pizzas.length > 0) {
      //adiciona informação de quantas pizzas foram adicionadas a base de calculo
      const messageOutput = pizzas.length > 1 ? 'pizzas adicionadas.' : 'pizza adicionada.'
      document.querySelector('#pizzasAdded').value = `${pizzas.length} ${messageOutput}`

      //se array pizza tem mais de 2 itens, é possivel realizar uma comparação, botao é habilitado
      if (pizzas.length > 1) {
        document.querySelector('#comparePizzas').classList.replace('button-hidden', 'button-visible')
        document.querySelector('#deleteLastPizza').classList.replace('button-hidden', 'button-visible')
      }
    }
  }

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
    const pizzasSortedByPrice = sort([...pizzas])
    const bestPrice = pizzasSortedByPrice[0]
    const pizzasWithRelativePrice = []
    pizzasSortedByPrice.forEach((pizza, index) => {
      if (index === 0) {
        pizzasWithRelativePrice.push({
          ...pizza,
          relativePrice: 'Melhor Preço'
        })
      } else {
        pizzasWithRelativePrice.push({
          ...pizza,
          relativePrice: getDiffPercent(bestPrice.absolutePrice, pizza.absolutePrice).toFixed(2)
        })
      }
    })

    // console.table(pizzasWithRelativePrice)
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
      const formattedPizzaSize = pizzaFormat === 'retangular'
        ? pizzaSize + 'x' + pizzaSize__rect + 'cm'
        : pizzaFormat === 'quadrada'
          ? pizzaSize + 'x' + pizzaSize + 'cm'
          : pizzaSize + 'cm'

      const formattedFullPrice = new Intl.NumberFormat('pt-BR', currencyOptions).format(pizzaPrice)
      const formattedAbsolutePrice = new Intl.NumberFormat('pt-BR', currencyOptions).format(absolutePrice)
      const formattedRelativePrice = relativePrice === 'Melhor Preço' ? relativePrice : `+${relativePrice}%`
      const newRow = createTableElements('tr', 'bg-white border-b dark:bg-stone-800 dark:border-stone-700') //cria a nova row
      const newTh = createTableElements('th', 'px-6 py-4 font-medium text-stone-900 whitespace-nowrap dark:text-white', pizzaName) //cria a <th> especifica dessa row
      newTh.setAttribute('scope', 'row') //define que essa <th> é referente à row
      newRow.appendChild(newTh) //insere a <th> criada dentro da nova row

      //inicializa criação dinamica dos elementos <td> 
      const pizzaTableData = [formattedPizzaSize, formattedFullPrice, formattedAbsolutePrice, formattedRelativePrice]

      pizzaTableData.forEach(data => {
        newRow.appendChild(createTableElements('td', 'px-6 py-4', data)) //cria e ja insere os elementos <td> ja passando as classes tailwind
      })
      tableOutput.appendChild(newRow) //insere a new row na tbody. processo se repete dentro do forEach
    })
    document.querySelector('#tableWrapper').classList.replace('table-hidden', 'table-visible') //altera a classe de visibilidade e mostra a tabela
  }

  //funcao cria elementos dinamicamente
  function createTableElements(tag, cls, content = '') {
    const newEl = document.createElement(tag)
    newEl.setAttribute('class', cls)
    newEl.innerHTML = content
    return newEl
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
