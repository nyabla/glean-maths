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

function renderViewMode(records: MutationRecord[], observer: MutationObserver) {
  for (const record of records) {
    for (const addedNode of record.addedNodes) {
      const selector = `p:not(.${classes.viewMode.extract})`
      const maths = addedNode.parentElement?.querySelectorAll(selector)

      maths?.forEach(node => {
        console.log(node)
        console.log(katexRender(node, katexConfig))
      })
    }
  }
}

function renderEventMode(records: MutationRecord[], observer: MutationObserver) {
  console.group("Record Set")
  for (const record of records) {
    for (const addedNode of record.addedNodes) {
      if (addedNode.nodeType !== Node.ELEMENT_NODE) {
        continue
      }

      const selector = `.${classes.eventMode.feedItem}`
      
      // look i know that addedNode has this  method 
      // because i check if its an element node
      const items = addedNode.querySelectorAll(selector)

      items.forEach(renderItem);
    }
  }
  console.groupEnd()
}

function renderItem(item: Element) {
  const comboboxes = item.querySelectorAll(`.${classes.eventMode.combobox}`)
  
  for (const box of comboboxes) {
    const textarea = box.querySelector('textarea')

    if (textarea === null) {
      continue
    }

    const container = document.createElement('div')
    container.classList.add("maths-container")
    container.tabIndex = 0
    container.innerText = textarea.textContent || ""
    
    container.id = crypto.randomUUID()
    textarea.setAttribute("data-maths-id", container.id)

    console.log(textarea, container)
    katexRender(container, katexConfig)

    if (container.innerHTML == (textarea.textContent || "")) continue;

    textarea.style.display = 'none'

    textarea.addEventListener('focus', _ => {
      container.tabIndex = -1
    })

    textarea.addEventListener('focusout', _ => {
      container.tabIndex = 0
      textarea.style.display = 'none'
    })

    container.addEventListener('focus', event => {
      if (event.relatedTarget != textarea) {
        textarea.style.display = 'flex'
        textarea.focus()
      }
    })

    container.addEventListener('click', _ => { 
      textarea.focus()
    })

    box.appendChild(container)
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
