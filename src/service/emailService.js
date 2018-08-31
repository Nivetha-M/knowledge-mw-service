var async = require('async')
var path = require('path')
var contentProvider = require('sb_content_provider_util')
var utilsService = require('./utilsService')
var filename = path.basename(__filename)
var LOG = require('sb_logger_util')
var messageUtils = require('./messageUtil')
var emailMessage = messageUtils.EMAIL
var responseCode = messageUtils.RESPONSE_CODE
var configUtil = require('sb-config-util')

/**
 * Below function is used to create email request object
 * @param {string} name
 * @param {string} subject
 * @param {string} body
 * @param {string} actionUrl
 * @param {string} actionName
 * @param {string} emailArray
 * @param {string} recipientUserIds
 * @param {string} emailTemplateType
 * @param {string} imageUrl
 */
function getEmailData (name, subject, body, actionUrl, actionName, emailArray,
  recipientUserIds, emailTemplateType, imageUrl) {
  var request = {
    name: name,
    subject: subject,
    body: body,
    actionUrl: actionUrl,
    actionName: actionName,
    recipientEmails: emailArray,
    recipientUserIds: recipientUserIds,
    emailTemplateType: emailTemplateType,
    orgImageUrl: imageUrl
  }
  return request
}

/**
 * Below function is used for send email when flag content api called
 * @param {object} req
 * @param {function} callback
 */
function createFlagContentEmail (req, callback) {
  var data = req.body
  data.contentId = req.params.contentId
  var rspObj = req.rspObj

  if (!data.contentId) {
    return callback(new Error('Required content id is missing'), null)
  }
  async.waterfall([
    function (CBW) {
      contentProvider.getContent(data.contentId, req.headers, function (err, res) {
        if (err || res.responseCode !== responseCode.SUCCESS) {
          callback(new Error('Invalid content id'), null)
        } else {
          data.request.contentData = res.result.content
          CBW()
        }
      })
    },
    function (CBW) {
      var cData = data.request.contentData
      var eData = emailMessage.CREATE_FLAG
      var flagReasons = cData.flagReasons ? cData.flagReasons.toString() : ''
      var subject = eData.SUBJECT.replace(/{{Content type}}/g, cData.contentType)
        .replace(/{{Content title}}/g, cData.name)
      var body = eData.BODY.replace(/{{Content type}}/g, cData.contentType)
        .replace(/{{Content title}}/g, cData.name)
        .replace(/{{Flag reason}}/g, flagReasons)
        .replace(/{{Content status}}/g, cData.status)
      var lsEmailData = {
        request: getEmailData(null, subject, body, null, null, null, [cData.createdBy], eData.TEMPLATE)
      }
      LOG.info(utilsService.getLoggerData(rspObj, 'INFO', filename, 'createFlagContentEmail',
        'Request to Leaner service to send email', {
          body: lsEmailData
        }))
      contentProvider.sendEmail(lsEmailData, req.headers, function (err, res) {
        if (err || res.responseCode !== responseCode.SUCCESS) {
          LOG.error(utilsService.getLoggerData(rspObj, 'ERROR', filename, 'createFlagContentEmail',
            'Sending email failed', res))
          callback(new Error('Sending email failed'), null)
        } else {
          CBW(null, res)
        }
      })
    },

    function (res) {
      LOG.info(utilsService.getLoggerData(rspObj, 'INFO', filename, 'createFlagContentEmail',
        'Email sent successfully', rspObj))
      callback(null, true)
    }
  ])
}

/**
 * Below function is used to send email when accept flag api called
 * @param {object} req
 * @param {function} callback
 */
function acceptFlagContentEmail (req, callback) {
  var data = req.body
  data.contentId = req.params.contentId
  var rspObj = req.rspObj

  if (data.contentId) {
    callback(new Error('Content id is missing'), null)
  }
  async.waterfall([
    function (CBW) {
      contentProvider.getContent(data.contentId, req.headers, function (err, res) {
        if (err || res.responseCode !== responseCode.SUCCESS) {
          callback(new Error('Invalid content id'), null)
        } else {
          data.request.contentData = res.result.content
          CBW()
        }
      })
    },
    function (CBW) {
      var cData = data.request.contentData
      var flagReasons = cData.flagReasons ? cData.flagReasons.toString() : ''
      var eData = emailMessage.ACCEPT_FLAG
      var subject = eData.SUBJECT.replace(/{{Content type}}/g, cData.contentType)
      var body = eData.BODY.replace(/{{Content type}}/g, cData.contentType)
        .replace(/{{Content title}}/g, cData.name)
        .replace(/{{Flag reason}}/g, flagReasons)
      var lsEmailData = {
        request: getEmailData(null, subject, body, null, null, null, [cData.createdBy], eData.TEMPLATE)
      }
      LOG.info(utilsService.getLoggerData(rspObj, 'INFO', filename, 'acceptFlagContentEmail',
        'Request to Leaner service to send email', {
          body: lsEmailData
        }))
      contentProvider.sendEmail(lsEmailData, req.headers, function (err, res) {
        if (err || res.responseCode !== responseCode.SUCCESS) {
          LOG.error(utilsService.getLoggerData(rspObj, 'ERROR', filename, 'acceptFlagContentEmail',
            'Sending email failed', res))
          callback(new Error('Sending email failed'), null)
        } else {
          CBW(null, res)
        }
      })
    },

    function (res) {
      LOG.info(utilsService.getLoggerData(rspObj, 'INFO', filename, 'acceptFlagContentEmail',
        'Email sent successfully', rspObj))
      callback(null, true)
    }
  ])
}

/**
 * Below function is used for send email when reject flag api called
 * @param {object} req
 * @param {function} callback
 */
function rejectFlagContentEmail (req, callback) {
  var data = req.body
  data.contentId = req.params.contentId
  var rspObj = req.rspObj

  if (data.contentId) {
    callback(new Error('Content id is missing'), null)
  }
  async.waterfall([
    function (CBW) {
      contentProvider.getContent(data.contentId, req.headers, function (err, res) {
        if (err || res.responseCode !== responseCode.SUCCESS) {
          callback(new Error('Invalid content id'), null)
        } else {
          data.request.contentData = res.result.content
          CBW()
        }
      })
    },
    function (CBW) {
      var cData = data.request.contentData
      var eData = emailMessage.REJECT_FLAG
      var subject = eData.SUBJECT.replace(/{{Content type}}/g, cData.contentType)
        .replace(/{{Content title}}/g, cData.name)
      var body = eData.BODY.replace(/{{Content type}}/g, cData.contentType)
        .replace(/{{Content title}}/g, cData.name)
        .replace(/{{Content status}}/g, cData.status)
      var lsEmailData = {
        request: getEmailData(null, subject, body, null, null, null, [cData.createdBy], eData.TEMPLATE)
      }
      LOG.info(utilsService.getLoggerData(rspObj, 'INFO', filename, 'rejectFlagContentEmail',
        'Request to Leaner service to send email', {
          body: lsEmailData
        }))
      contentProvider.sendEmail(lsEmailData, req.headers, function (err, res) {
        if (err || res.responseCode !== responseCode.SUCCESS) {
          LOG.error(utilsService.getLoggerData(rspObj, 'ERROR', filename, 'rejectFlagContentEmail',
            'Sending email failed', res))
          callback(new Error('Sending email failed'), null)
        } else {
          CBW(null, res)
        }
      })
    },

    function (res) {
      LOG.info(utilsService.getLoggerData(rspObj, 'INFO', filename, 'rejectFlagContentEmail',
        'Email sent successfully', rspObj))
      callback(null, true)
    }
  ])
}

/**
 * Below function is used to fetch content details using content id
 * @param {object} req
 */
function getContentDetails (req) {
  return function (callback) {
    contentProvider.getContent(req.params.contentId, req.headers, function (err, result) {
      LOG.error(utilsService.getLoggerData(req.rspObj, 'ERROR', filename, 'Get content details error',
        'Get content details error', err))
      LOG.info(utilsService.getLoggerData(req.rspObj, 'INFO', filename, 'Get content details success',
        'Get content details result', result))

      if (err || result.responseCode !== responseCode.SUCCESS) {
        callback(new Error('Invalid content id'), null)
      } else {
        callback(null, result)
      }
    })
  }
}

/**
 * Below function is used to fetch email template using Form API
 * @param {object} formRequest
 */
function getTemplateConfig (formRequest) {
  return function (callback) {
    contentProvider.getForm(formRequest, {}, function (err, result) {
      LOG.error(utilsService.getLoggerData(formRequest, 'ERROR', filename, 'Form API error',
        'Check Template config error', err))
      LOG.info(utilsService.getLoggerData(formRequest, 'INFO', filename, 'Form API success',
        'Check Template config result', result))

      if (err || result.responseCode !== responseCode.SUCCESS) {
        callback(new Error('Form API failed'), null)
      } else {
        callback(null, result)
      }
    })
  }
}

/**
 * Below function is used construct content link which will be sent to the
 * content creator after the content is published
 * @param {object} content
 */
function getPublishedContentUrl (content) {
  var baseUrl = configUtil.getConfig('SUNBIRD_PORTAL_BASE_URL')
  if (content.mimeType === 'application/vnd.ekstep.content-collection') {
    if (content.contentType !== 'Course') {
      return baseUrl + '/resources/play/collection/' + content.identifier
    } else {
      return baseUrl + '/learn/course/' + content.identifier
    }
  } else if (content.mimeType === 'application/vnd.ekstep.ecml-archive') {
    return baseUrl + '/resources/play/content/' + content.identifier
  } else {
    return baseUrl + '/resources/play/content/' + content.identifier
  }
}
/**
 * Below function is used construct content link which will be sent to creator
 * after the content is rejected
 * @param {object} content
 */
function getDraftContentUrl (content) {
  var baseUrl = configUtil.getConfig('SUNBIRD_PORTAL_BASE_URL') + '/workspace/content/edit'
  if (content.mimeType === 'application/vnd.ekstep.content-collection') {
    return baseUrl + '/collection/' + content.identifier + '/' + content.contentType +
    '/draft/' + content.framework
  } else if (content.mimeType === 'application/vnd.ekstep.ecml-archive') {
    return baseUrl + '/content/' + content.identifier + '/draft/' + content.framework
  } else {
    return baseUrl + '/genric/' + content.identifier + '/draft/' + content.framework
  }
}

/**
 * Below function is used construct content link which will be sent to reviewers
 * @param {object} content
 */
function getReviewContentUrl (content) {
  var baseUrl = configUtil.getConfig('SUNBIRD_PORTAL_BASE_URL') + '/workspace/content'
  if (content.mimeType === 'application/vnd.ekstep.content-collection') {
    return baseUrl + '/edit/collection/' + content.identifier + '/' + content.contentType +
    '/upForReview/' + content.framework
  } else if (content.mimeType === 'application/vnd.ekstep.ecml-archive') {
    return baseUrl + '/upForReview/content/' + content.identifier
  } else {
    return baseUrl + '/upForReview/content/' + content.identifier
  }
}

/**
 * Below function is used to send email
 * @param {object} req
 * @param {function} action
 * @param {function} callback
 */
function sendContentEmail (req, action, callback) {
  if (!req.params.contentId) {
    LOG.error(utilsService.getLoggerData(req.rspObj, 'ERROR', filename, action,
      'Content id is missing', null))
    callback(new Error('Content id is missing'), null)
  }
  var formRequest = {
    request: {
      'type': 'notification',
      'action': action,
      'subType': 'email',
      'rootOrgId': req.get('x-channel-id')
    }
  }
  async.waterfall([
    function (callback) {
      async.parallel({
        contentDetails: getContentDetails(req),
        templateConfig: getTemplateConfig(formRequest)
      }, function (err, results) {
        if (err) {
          callback(err, null)
        } else {
          callback(null, results)
        }
      })
    },
    function (data, callback) {
      var cData = data.contentDetails.result.content
      var eData = data.templateConfig.result.form.data.fields[0]
      var subject = eData.subject
      var body = eData.body

      // Creating content link for email template
      var contentLink = ''
      if (action === 'sendForReview') {
        contentLink = getReviewContentUrl(cData)
      } else if (action === 'requestForChanges') {
        contentLink = getDraftContentUrl(cData)
      } else if (action === 'publish') {
        contentLink = getPublishedContentUrl(cData)
      }

      // Replacing dynamic content data with email template
      subject = subject.replace(/{{Content type}}/g, cData.contentType)
        .replace(/{{Content title}}/g, cData.name)
      body = body.replace(/{{Content type}}/g, cData.contentType)
        .replace(/{{Content title}}/g, cData.name)
        .replace(/{{Content link}}/g, contentLink)
        .replace(/{{Creator name}}/g, req.headers['userName'])
        .replace(/{{Reviewer name}}/g, req.headers['userName'])

      // Fetching email request body for sending email
      var lsEmailData = {
        request: getEmailData(null, subject, body, null, null, null,
          [cData.createdBy], data.templateConfig.result.form.data.templateName, eData.logo)
      }

      // Attaching recipientSearchQuery for send for review in email request body
      if (action === 'sendForReview') {
        lsEmailData.request.recipientSearchQuery = {
          'filters': {
            'channel': req.get('x-channel-id'),
            'organisations.roles': ['CONTENT_REVIEWER']
          }
        }
      }
      contentProvider.sendEmail(lsEmailData, req.headers, function (err, res) {
        console.log('-----', err, res)
        LOG.error(utilsService.getLoggerData(req.rspObj, 'ERROR', filename, action,
          'Sending email failed', err))
        LOG.info(utilsService.getLoggerData(req.rspObj, 'INFO', filename, action,
          'Check email went or not', res))
        if (err || res.responseCode !== responseCode.SUCCESS) {
          callback(new Error('Sending email failed!'), null)
        } else {
          callback(null, data)
        }
      })
    }
  ], function (err, data) {
    LOG.error(utilsService.getLoggerData(req.rspObj, 'ERROR', filename, action,
      'Finally sending email failed', err))
    LOG.info(utilsService.getLoggerData(req.rspObj, 'INFO', filename, action,
      'Finally email sent', data))
    if (err) {
      console.log('Email failed')
      // LOG.error(utilsService.getLoggerData(req.rspObj, 'ERROR', filename, action,
      //   'Sending email failed', err))
      callback(new Error('Sending email failed'), null)
    } else {
      console.log('Email sent')
      callback(null, true)
    }
  })
}

/**
 * Below function is used for send email when published content api called
 * @param {object} req
 * @param {function} callback
 */
function publishedContentEmail (req, callback) {
  sendContentEmail(req, 'publish', callback)
}

/**
 * Below function is used for send email when review content api called
 * @param {object} req
 * @param {function} callback
 */
function reviewContentEmail (req, callback) {
  sendContentEmail(req, 'sendForReview', callback)
}

/**
 * Below function is used for send email when reject content api called
 * @param {object} req
 * @param {function} callback
 */
function rejectContentEmail (req, callback) {
  sendContentEmail(req, 'requestForChanges', callback)
}

/**
 * [getUnlistedShareUrl Return share url for unlisted content]
 * @param  {[Object]} cData   [content data]
 * @param  {[String]} baseUri [base url]
 * @return {[String]}         [share url]
 */
var getUnlistedShareUrl = function (cData, baseUri) {
  if (cData.contentType === 'Course') {
    return baseUri + '/learn/course' + '/' + cData.identifier + '/Unlisted'
  } else if (cData.mimeType === 'application/vnd.ekstep.content-collection') {
    return baseUri + '/resources/play/collection' + '/' + cData.identifier + '/Unlisted'
  } else {
    return baseUri + '/resources/play/content' + '/' + cData.identifier + '/Unlisted'
  }
}

/**
 * Below function is used for send email when unlist publish content api called
 * @param {object} req
 * @param {function} callback
 */
function unlistedPublishContentEmail (req, callback) {
  var data = req.body
  data.contentId = req.params.contentId
  var rspObj = req.rspObj
  var baseUrl = data.request && data.request.content && data.request.content.baseUrl ? data.request.content.baseUrl : ''

  if (data.contentId) {
    callback(new Error('Content id missing'), null)
  }
  async.waterfall([
    function (CBW) {
      contentProvider.getContent(data.contentId, req.headers, function (err, res) {
        if (err || res.responseCode !== responseCode.SUCCESS) {
          callback(new Error('Invalid content id'), null)
        } else {
          data.request.contentData = res.result.content
          CBW()
        }
      })
    },
    function (CBW) {
      var cData = data.request.contentData
      var eData = emailMessage.UNLISTED_PUBLISH_CONTENT
      var subject = eData.SUBJECT.replace(/{{Content title}}/g, cData.name)
      var shareUrl = getUnlistedShareUrl(cData, baseUrl)
      var body = eData.BODY.replace(/{{Content type}}/g, cData.contentType)
        .replace(/{{Content title}}/g, cData.name)
        .replace(/{{Share url}}/g, shareUrl)
        .replace(/{{Share url}}/g, shareUrl)
      var lsEmailData = {
        request: getEmailData(null, subject, body, null, null, null, [cData.createdBy], eData.TEMPLATE)
      }
      LOG.info(utilsService.getLoggerData(rspObj, 'INFO', filename, 'unlistedPublishContentEmail',
        'Request to Leaner service to send email', {
          body: lsEmailData
        }))
      contentProvider.sendEmail(lsEmailData, req.headers, function (err, res) {
        if (err || res.responseCode !== responseCode.SUCCESS) {
          LOG.error(utilsService.getLoggerData(rspObj, 'ERROR', filename, 'unlistedPublishContentEmail',
            'Sending email failed', res))
          callback(new Error('Sending email failed'), null)
        } else {
          CBW(null, res)
        }
      })
    },

    function (res) {
      LOG.info(utilsService.getLoggerData(rspObj, 'INFO', filename, 'unlistedPublishContentEmail',
        'Email sent successfully', rspObj))
      callback(null, true)
    }
  ])
}

module.exports.createFlagContentEmail = createFlagContentEmail
module.exports.acceptFlagContentEmail = acceptFlagContentEmail
module.exports.rejectFlagContentEmail = rejectFlagContentEmail
module.exports.publishedContentEmail = publishedContentEmail
module.exports.rejectContentEmail = rejectContentEmail
module.exports.reviewContentEmail = reviewContentEmail
module.exports.unlistedPublishContentEmail = unlistedPublishContentEmail
