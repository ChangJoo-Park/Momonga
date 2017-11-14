const post = (context, item) => {
  return context.put(item)
}

const update = (context, item, params) => {
  return context.get(item._id).then(doc => {
    for (let property in params) {
      doc[property] = params[property]
    }
    return context.put(doc)
  })
}

const destroy = (context, item) => {
  return context.get(item._id).then(doc => {
    return context.remove(doc)
  })
}

export default {
  post,
  update,
  destroy
}
