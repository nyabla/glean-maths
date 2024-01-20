import katexRender from 'katex/dist/contrib/auto-render'
import katexConfig from './katex-config.json'

const classes = {
  viewMode: {
    extract: 'ViewModeDefinition-module__extract___23XVn',
  },
  eventMode: {
    feedItem: 'feed-item',
    selectedFeedItem: 'feed-item--selected',
    combobox: 'combobox',
    comboboxText: 'feed-item-text-card__combobox',
    mathbox: 'mathbox',
  },
};

function isViewMode(): boolean {
  const path = location.pathname.split('/')
  const lastIndex = path.length - 1
  return path[lastIndex] === 'view'
}

function isKatex(element: HTMLElement): boolean {
  return element.querySelector('.katex') != null
}

function renderViewMode(records: MutationRecord[], observer: MutationObserver) {
  for (const record of records) {
    for (const addedNode of record.addedNodes) {
      const selector = `p[data-test="ReadingViewText.text"]`
      const maybeMaths = addedNode.parentElement?.querySelectorAll(selector)
      maybeMaths?.forEach(element => {
        katexRender(element, katexConfig)
      })
    }
  }
}

function renderEventMode(records: MutationRecord[], observer: MutationObserver) {
  for (const record of records) {
    for (const addedNode of record.addedNodes) {
      if (addedNode.nodeType !== Node.ELEMENT_NODE) {
        continue
      }

      const selector = `.${classes.eventMode.feedItem}`
      const items = (addedNode as Element).querySelectorAll(selector)

      items.forEach(configItem);
    }
  }
}

function configItem(item: Element) {
  const cards = item.querySelectorAll(`.${classes.eventMode.combobox}`)
  
  for (const card of cards) {
    const textarea = card.querySelector('textarea')

    if (textarea === null) {
      continue
    }

    textarea.addEventListener('input', _ => {
      renderCard(card, true)
    })

    renderCard(card)
  }
}

function renderCard(card: Element, change = false) {
  const textarea = card.querySelector('textarea')
  if (textarea === null) {
    return
  }

  if (textarea.hasAttribute('data-maths-id')) {
    const mathsId = textarea.getAttribute('data-maths-id') || ''
    const container = document.getElementById(mathsId) || new Element()
    const tempContainer = document.createElement('div')

    tempContainer.innerText = textarea.value
    katexRender(tempContainer, katexConfig)

    if (!isKatex(tempContainer)) {
      textarea.removeAttribute('data-maths-id')
      textarea.style.display = 'flex'

      textarea.removeEventListener('focus', textareaFocus)
      textarea.removeEventListener('focusout', textareaFocusOut)
      card.removeChild(container)

      return
    }

    container.replaceChildren(...tempContainer.childNodes)

    return
  }

  const container = document.createElement('div')
  container.classList.add(classes.eventMode.mathbox)
  container.tabIndex = 0
  container.innerText = textarea.value
  
  container.id = crypto.randomUUID()

  katexRender(container, katexConfig)

  if (!isKatex(container)) {
    return
  }

  textarea.setAttribute("data-maths-id", container.id)

  if (!change) {
    textarea.style.display = 'none'
  }

  textarea.parentElement
  textarea.addEventListener('focus', textareaFocus)
  textarea.addEventListener('focusout', textareaFocusOut)

  container.addEventListener('focus', event => {
    if (event.relatedTarget != textarea) {
      textarea.style.display = 'flex'
      textarea.focus()
    }
  })

  container.addEventListener('click', _ => { 
    textarea.focus()
  })

  card.appendChild(container)
}

function textareaFocus(event: FocusEvent) {
  const textarea = event.target as HTMLTextAreaElement
  const parent = textarea.parentElement
  const container = parent?.querySelector<HTMLDivElement>(`.${classes.eventMode.mathbox}`)
  if (container != null) {
    container.tabIndex = -1
  }
}

function textareaFocusOut(event: FocusEvent) {
  const textarea = event.target as HTMLTextAreaElement
  const parent = textarea.parentElement
  const container = parent?.querySelector<HTMLDivElement>(`.${classes.eventMode.mathbox}`)
  if (container != null) {
    container.tabIndex = 0
    console.log(textarea)
    textarea.style.display = 'none'
  }
}

const observerOptions = {
  childList: true,
  subtree: true,
};

function callback(records: MutationRecord[], observer: MutationObserver) {
  if (isViewMode()) {
    renderViewMode(records, observer)
  } else {
    renderEventMode(records, observer)
  }
}

const observer = new MutationObserver(callback);
observer.observe(document.body, observerOptions);
