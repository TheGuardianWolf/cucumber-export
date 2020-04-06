const moment = require('moment')

module.exports = function (metadata, testResult) {
  console.log(testResult)

  const features = testResult.map(feature => {
    const scenarios = feature.elements.map(scenario => {
      scenario.step_passed = scenario.steps.filter(r => r.result.status === 'passed').length
      scenario.step_failed = scenario.steps.filter(r => r.result.status === 'failed').length
      scenario.step_skipped = scenario.steps.filter(r => r.result.status === 'skipped').length
      scenario.step_undefined = scenario.steps.filter(r => r.result.status === 'undefined').length

      scenario.result = scenario.step_passed === scenario.steps.length

      if (!scenario.status && scenario.step_failed) scenario.status = 'failed'
      if (!scenario.status && scenario.step_skipped) scenario.status = 'skipped'
      if (!scenario.status && scenario.result) scenario.status = 'passed'
      if (!scenario.status) scenario.status = 'undefined'

      scenario.duration = scenario.steps.reduce((r, i) => r + ((i.result && i.result.duration) || 0), 0)
      scenario.duration = scenario.duration / 1000000000 // 'secondes'
      scenario.timestamp = moment().format()

      scenario.metadata = metadata

      return scenario
    })

    feature.elements = scenarios

    feature.total = feature.elements.length
    feature.passed = feature.elements.filter(_ => _.status === 'passed').length
    feature.failed = feature.elements.filter(_ => _.status === 'failed').length
    feature.skipped = feature.elements.filter(_ => _.status === 'skipped').length
    feature.undefined = feature.elements.filter(_ => _.status === 'undefined').length

    feature.result = feature.total === feature.passed

    feature.duration = feature.elements.reduce((r, i) => r + i.duration, 0)

    feature.timestamp = moment().format()
    feature.type = 'feature'
    feature.feature_name = feature.name
    delete feature.name

    feature.metadata = metadata
    return feature
  })

  const testRun = {
    ...metadata,
    timestamp: moment().format(),
    type: 'testRun',
    total: features.length,
    passed: features.filter(r => r.result).length,
    failed: features.filter(r => !r.result).length,
    features
  }

  return testRun
}