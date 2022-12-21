import app from 'app';
import SoaService from 'soa/kernel/soaService';
import notySvc from 'js/NotyModule';
import query from 'js/utils/lgepQueryUtils';
import com from 'js/utils/lgepObjectUtils';
import _ from 'lodash';
// import viewC from "js/viewModelObjectService";
// import treeView from "js/awTableService";
import eventBus from 'js/eventBus';
import 'summernote/dist/summernote-lite';
import lgepLocalizationUtils from 'js/utils/lgepLocalizationUtils';
import 'summernote/dist/summernote-lite.css';
import vms from 'js/viewModelService';
import message from 'js/utils/lgepMessagingUtils';
import AwPromiseService from 'js/awPromiseService';
import AwcObjectUtil from 'js/utils/lgepObjectUtils';
import browserUtils from 'js/browserUtils';
import lgepSummerNoteUtils from 'js/utils/lgepSummerNoteUtils';
import common from 'js/utils/lgepCommonUtils';
import advancedSearchUtils from 'js/advancedSearchUtils';
import lgepLoadingUtils from 'js/utils/lgepLoadingUtils';
var $ = require('jQuery');

let firstPage = 1;
let lastPage = 1;
let nowPage = 1;
let dividePage = 5;
let showItem = 20;

let characterLimitMsg = lgepLocalizationUtils.getLocalizedText('lgepKnowldegeManageMessages', 'characterLimitMsg');

export function datasetLinkAction(data) {
  window.open(browserUtils.getBaseURL() + '#/com.siemens.splm.clientfx.tcui.xrt.showObject?uid=' + data.datasetLink.dbValues[0]);
}

//전문가 관리.js 시작
export async function expertStateChange(data) {
  const expertData = vms.getViewModelUsingElement(document.getElementById('expertManageData'));
  let selectedUser = expertData.dataProviders.expertDataProvider.selectedObjects[0];
  let state;
  if (data.expertState.dbValue == 'O') {
    state = '1';
  } else if (data.expertState.dbValue == 'X') {
    state = '0';
  }
  let param = {
    objects: [selectedUser],
    attributes: {
      l2_is_expert: {
        stringVec: [state],
      },
      l2_expert_coverages: {
        stringVec: [data.specializedField.dbValue],
      },
    },
  };
  try {
    await SoaService.post('Core-2007-01-DataManagement', 'setProperties', param);
  } catch (err) {
    //console.log(err);
  }
  eventBus.publish('expertList.plTable.reload');

  message.show(
    0,
    lgepLocalizationUtils.getLocalizedText('lgepTechnicalMessages', 'expertStateChange'),
    [lgepLocalizationUtils.getLocalizedText('lgepTechnicalMessages', 'close')],
    [function () {}],
  );
  expertData.expertState.uiValue = data.expertState.dbValue;
}
export function expertInitialize(data) {
  const expertData = vms.getViewModelUsingElement(document.getElementById('expertManageData'));
  let selectedUser = expertData.dataProviders.expertDataProvider.selectedObjects[0];
  const approvalData = vms.getViewModelUsingElement(document.getElementById('approvalData'));

  approvalData.userName.uiValue = selectedUser.props.l2_user_name.uiValues[0];
  approvalData.userName.dbValue = selectedUser.props.l2_user_name.uiValues[0];
  approvalData.expertState.uiValue = selectedUser.props.l2_is_expert.uiValues[0];
  approvalData.expertState.dbValue = selectedUser.props.l2_is_expert.uiValues[0];
  approvalData.specializedField.uiValue = selectedUser.props.l2_expert_coverages.uiValues[0];
  approvalData.specializedField.dbValue = selectedUser.props.l2_expert_coverages.uiValues[0];
}

export function expertLabel(value, data) {
  data.expertName.uiValue = value.props.l2_user_name.uiValues[0];
  data.expertState.uiValue = value.props.l2_is_expert.uiValues[0];
  data.answerCount.uiValue = value.props.l2_answer_count.uiValues[0];
  data.expertCoverages.uiValue = value.props.l2_expert_coverages.uiValues[0];
}

export function userExpertSelectedCheck(value) {
  if (value.expertDataProvider.selectedObjects.length <= 0) {
    message.show(
      1,
      lgepLocalizationUtils.getLocalizedText('lgepTechnicalMessages', 'noneSelUser'),
      [lgepLocalizationUtils.getLocalizedText('lgepTechnicalMessages', 'close')],
      [function () {}],
    );
    return {
      userExpertSelectedState: false,
    };
  } else {
    return {
      userExpertSelectedState: true,
    };
  }
}
//전문가 관리.js 끝

//포인트 관리.js 시작
export async function paymentPoint(data) {
  const pointData = vms.getViewModelUsingElement(document.getElementById('pointManageData'));
  let selectedUser = pointData.dataProviders.userDataProvider.selectedObjects[0];
  if (isNaN(data.userPoint.dbValue)) {
    message.show(
      1,
      lgepLocalizationUtils.getLocalizedText('lgepTechnicalMessages', 'onlyNumber'),
      [lgepLocalizationUtils.getLocalizedText('lgepTechnicalMessages', 'close')],
      [function () {}],
    );
    return {
      isNumber: false,
    };
  }
  let param = {
    objects: [selectedUser],
    attributes: {
      l2_point: {
        stringVec: [data.userPoint.dbValue],
      },
    },
  };
  try {
    await SoaService.post('Core-2007-01-DataManagement', 'setProperties', param);
  } catch (err) {
    //console.log(err);
    message.show(
      2,
      lgepLocalizationUtils.getLocalizedText('lgepTechnicalMessages', 'pointEditFail'),
      [lgepLocalizationUtils.getLocalizedText('lgepTechnicalMessages', 'close')],
      [function () {}],
    );
    return {
      isNumber: true,
    };
  }
  message.show(
    0,
    lgepLocalizationUtils.getLocalizedText('lgepTechnicalMessages', 'pointEditSuccess'),
    [lgepLocalizationUtils.getLocalizedText('lgepTechnicalMessages', 'close')],
    [function () {}],
  );
  eventBus.publish('userList.plTable.reload');
  return {
    isNumber: true,
  };
}

export function userSelectedCheck(value) {
  if (value.userDataProvider.selectedObjects.length <= 0) {
    message.show(
      1,
      lgepLocalizationUtils.getLocalizedText('lgepTechnicalMessages', 'pointEditUserSel'),
      [lgepLocalizationUtils.getLocalizedText('lgepTechnicalMessages', 'close')],
      [function () {}],
    );
    return {
      userSelectedState: false,
    };
  } else {
    return {
      userSelectedState: true,
    };
  }
}

export function pointInitialize(data) {
  const pointData = vms.getViewModelUsingElement(document.getElementById('pointManageData'));
  let selectedUser = pointData.dataProviders.userDataProvider.selectedObjects[0];

  data.userName.uiValue = selectedUser.props.l2_user_name.uiValues[0];
  data.userPoint.dbValue = selectedUser.props.l2_point.uiValues[0];
}

export async function pointLabel(value, data) {
  data.expertName.uiValue = value.props.l2_user_name.uiValues[0];
  data.knowledgePoint.uiValue = value.props.l2_point.uiValues[0];
  data.knowledgeCount.uiValue = value.props.l2_knowledge_count.uiValues[0];
  data.answerCount.uiValue = value.props.l2_answer_count.uiValues[0];
}

export async function getUserTable() {
  initialize();
  // let getFolder = com.getObject("A2uJ4oUsZx_JkD");
  let getFolder = {
    uids: ['bOvJY503Zx_JkD'],
  };

  try {
    getFolder = await SoaService.post('Core-2007-09-DataManagement', 'loadObjects', getFolder);
  } catch (err) {
    //console.log(err);
  }
  getFolder = Object.values(getFolder.modelObjects)[0];
  await com.getProperties([getFolder], ['contents']);

  let userData = com.getObject(getFolder.props.contents.dbValues);
  if (!Array.isArray(userData)) {
    userData = [userData];
  }
  await com.getProperties(userData, [
    'l2_is_expert',
    'l2_answer_count',
    'l2_point',
    'l2_knowledge_count',
    'l2_user_name',
    'l2_user_id',
    'l2_selected_knowledge_count',
    'l2_good_count',
    'l2_expert_coverages',
  ]);
  _.forEach(userData, function (data) {
    if (data.props.l2_is_expert.uiValues[0] == 'False') {
      data.props.l2_is_expert.uiValues[0] = 'X';
    } else if (data.props.l2_is_expert.uiValues[0] == 'True') {
      data.props.l2_is_expert.uiValues[0] = 'O';
    }
  });

  return {
    result: userData,
  };
}
//포인트 관리.js 끝

//기술 문서.js 시작 테이블 필터링 메소드 포함
let editFileOverlap = false;
let datasetUid = null;

export async function likeUp(value, data, ctx) {
  if (value) {
    let selectedA = value;
    let owningUser = selectedA.props.owning_user.uiValues[0];
    let searchingUser = await query.executeSavedQuery('KnowledgeUserSearch', ['L2_user_id'], [owningUser]);
    searchingUser = searchingUser[0];
    await com.getProperties([searchingUser], ['l2_point', 'l2_good_count']);
    let goodCnt = Number(searchingUser.props.l2_good_count.dbValues[0]);

    let likeOverlap;
    let count = await query.executeSavedQuery('ReplySearch', ['L2_item_id', 'L2_object_type'], [selectedA.props.item_id.uiValue, 'L2_LikeRevision']);

    let param = {
      objects: count,
      attributes: ['owning_user', 'l2_reference_post'],
    };
    try {
      await SoaService.post('Core-2006-03-DataManagement', 'getProperties', param);
    } catch (err) {
      //console.log(err);
    }

    let delItem;
    if (count != null) {
      for (let reply of count) {
        if (reply.props.owning_user.dbValues[0] === ctx.user.uid) {
          delItem = reply;
          likeOverlap = true;
          break;
        } else {
          likeOverlap = false;
        }
      }
    }

    if (likeOverlap) {
      message.show(
        1,
        lgepLocalizationUtils.getLocalizedText('lgepKnowldegeManageMessages', 'checkDislikeTech'),
        [
          lgepLocalizationUtils.getLocalizedText('lgepKnowldegeManageMessages', 'yes'),
          lgepLocalizationUtils.getLocalizedText('lgepKnowldegeManageMessages', 'no'),
        ],
        [
          async function () {
            let deleteItem = {
              objects: [com.getObject(delItem.props.items_tag.dbValues[0])],
            };

            await SoaService.post('Core-2006-03-DataManagement', 'deleteObjects', deleteItem);
            // eventBus.publish("qaListDataProvider.selectionChangeEvent");
            // eventBus.publish("qaAnswerList.listUpdated");

            let count = await query.executeSavedQuery('ReplySearch', ['L2_item_id', 'L2_object_type'], [value.props.item_id.uiValues[0], 'L2_LikeRevision']);
            count = count != null ? count.length : 0;
            // data.wriLike.uiValue = count;

            let viewCount = Number(value.props.l2_views.uiValues[0]) - 1;
            let param = {
              objects: [value],
              attributes: {
                l2_views: {
                  stringVec: [String(viewCount)],
                },
                l2_like_count: {
                  stringVec: [String(count)],
                },
              },
            };
            try {
              await SoaService.post('Core-2007-01-DataManagement', 'setProperties', param);
            } catch (err) {
              //console.log(err);
            }

            goodCnt--;

            try {
              let setPropsItem = {
                objects: [searchingUser],
                attributes: {
                  l2_good_count: {
                    stringVec: [String(goodCnt)],
                  },
                },
              };
              await SoaService.post('Core-2007-01-DataManagement', 'setProperties', setPropsItem);
            } catch (err) {
              //console.log(err);
            }

            // data.likeBtn.iconName = "ThumbsUp";
            message.show(0, lgepLocalizationUtils.getLocalizedText('lgepKnowldegeManageMessages', 'checkClickDislike'), null, [function () {}]);
            inLabel(value, data);
          },
          function () {},
        ],
      );
    } else {
      // 이 답변을 좋아합니다.
      let createItems = {
        properties: [
          {
            name: 'Like',
            type: 'L2_Like',
            revId: 'A',
          },
        ],
      };
      let createItemRev = await SoaService.post('Core-2006-03-DataManagement', 'createItems', createItems);
      try {
        let setUpdateItem = {
          objects: [createItemRev.output[0].itemRev],
          attributes: {
            l2_reference_post: {
              stringVec: selectedA.props.items_tag.dbValues,
            },
          },
        };

        await SoaService.post('Core-2007-01-DataManagement', 'setProperties', setUpdateItem);

        // eventBus.publish("qaListDataProvider.selectionChangeEvent");
        // eventBus.publish("qaAnswerList.listUpdated");

        let count = await query.executeSavedQuery('ReplySearch', ['L2_item_id', 'L2_object_type'], [value.props.item_id.uiValues[0], 'L2_LikeRevision']);
        count = count != null ? count.length : 0;
        // data.wriLike.uiValue = count;

        let viewCount = Number(value.props.l2_views.uiValues[0]) - 1;
        let param = {
          objects: [value],
          attributes: {
            l2_views: {
              stringVec: [String(viewCount)],
            },
            l2_like_count: {
              stringVec: [String(count)],
            },
          },
        };
        try {
          await SoaService.post('Core-2007-01-DataManagement', 'setProperties', param);
        } catch (err) {
          //console.log(err);
        }

        goodCnt++;

        let setPropsItem = {
          objects: [searchingUser],
          attributes: {
            l2_good_count: {
              stringVec: [String(goodCnt)],
            },
          },
        };
        await SoaService.post('Core-2007-01-DataManagement', 'setProperties', setPropsItem);

        message.show(0, lgepLocalizationUtils.getLocalizedText('lgepKnowldegeManageMessages', 'checkClickLike'), null, [function () {}]);
        inLabel(value, data);
        // data.likeBtn.iconName = "ThumbsUpFilled";
      } catch (err) {
        //console.log(err);
      }
    }
  }
}

export async function editTechnicalDocument(data) {
  const mainPageData = vms.getViewModelUsingElement(document.getElementById('mainTechnicalData'));
  let selectedTable = mainPageData.dataProviders.technicalDataProvider.selectedObjects[0];

  let contentString = $('#technicalEditSummernote').summernote('code');
  if (contentString == null || contentString == '' || contentString == '<p><br></p>') {
    notySvc.showError('내용을 입력해주세요.');
    return;
  } else if (!data.technicalTitle.dbValue || data.technicalTitle.dbValue == '') {
    notySvc.showError('제목을 입력해주세요.');
    return;
  } else {
    //정규식을 사용하여 이미지를 제외한 문자열만 남긴다.
    try {
      let contentOnlyString = await lgepSummerNoteUtils.imgAndsvgOnlyString(contentString);
      let param = {
        objects: [selectedTable],
        attributes: {
          object_name: {
            stringVec: [data.technicalTitle.dbValue],
          },
          l2_content_string: {
            stringVec: [contentOnlyString],
          },
        },
      };

      await SoaService.post('Core-2007-01-DataManagement', 'setProperties', param);
      let IMANs = selectedTable.props.IMAN_specification.dbValues;
      let num;
      if (selectedTable.props.IMAN_specification.uiValues.length > 0) {
        for (let i in IMANs) {
          if (com.getObject(IMANs[i]).type !== 'Text') {
            num = i;
          }
        }
      }
      let oldFileName = '';
      let oldFileUid = '';
      if (num) {
        oldFileName = selectedTable.props.IMAN_specification.uiValues[num];
        oldFileUid = selectedTable.props.IMAN_specification.dbValues[num];
      }
      await lgepSummerNoteUtils.txtFileToDatasetNoDelete(contentString, selectedTable);
      //console.log(oldFileName,data.fileName);
      // 선택한 파일이 기존 파일과 이름이 같을떄
      if (oldFileName == data.fileName) {
        // 기존 파일이 없고 새파일 업로드
      } else if (oldFileUid == undefined && (datasetUid != '' || datasetUid != null)) {
        param = {
          input: [
            {
              clientId: '',
              relationType: 'IMAN_specification',
              primaryObject: selectedTable,
              secondaryObject: com.getObject(datasetUid),
            },
          ],
        };
        try {
          await SoaService.post('Core-2006-03-DataManagement', 'createRelations', param);
        } catch (err) {
          //console.log(err);
        }
        // 선택한 아이템 모델의 값은 존재하지만 입력한 UID값이 존재하지 않을 때
      } else if ((oldFileUid != '' || oldFileUid != null) && (datasetUid == '' || datasetUid == null)) {
        param = {
          input: [
            {
              clientId: '',
              relationType: 'IMAN_specification',
              primaryObject: selectedTable,
              secondaryObject: com.getObject(oldFileUid),
            },
          ],
        };
        try {
          await SoaService.post('Core-2006-03-DataManagement', 'deleteRelations', param);
        } catch (err) {
          //console.log(err)
        }
        let testParam = {
          objects: [com.getObject(oldFileUid)],
        };
        try {
          await SoaService.post('Core-2006-03-DataManagement', 'deleteObjects', testParam);
        } catch (err) {
          //console.log(err)
        }
      } else {
        // 선택한 아이템 모델의 값과 입력한 UID값이 존재할 때
        param = {
          input: [
            {
              clientId: '',
              relationType: 'IMAN_specification',
              primaryObject: selectedTable,
              secondaryObject: com.getObject(datasetUid),
            },
          ],
        };
        try {
          await SoaService.post('Core-2006-03-DataManagement', 'createRelations', param);
        } catch (err) {
          //console.log(err);
        }
        param = {
          input: [
            {
              clientId: '',
              relationType: 'IMAN_specification',
              primaryObject: selectedTable,
              secondaryObject: com.getObject(oldFileUid),
            },
          ],
        };
        try {
          await SoaService.post('Core-2006-03-DataManagement', 'deleteRelations', param);
        } catch (err) {
          //console.log(err)
        }
        let testParam = {
          objects: [com.getObject(oldFileUid)],
        };
        try {
          await SoaService.post('Core-2006-03-DataManagement', 'deleteObjects', testParam);
        } catch (err) {
          //console.log(err)
        }
      }
      datasetUid = null;
      await common.userLogsInsert('Update Document', selectedTable.uid, 'S', 'Success');
      message.show(
        0,
        lgepLocalizationUtils.getLocalizedText('lgepTechnicalMessages', 'editSuccess'),
        [lgepLocalizationUtils.getLocalizedText('lgepTechnicalMessages', 'close')],
        [function () {}],
      );
      eventBus.publish('awPopup.close');
      inLabel(selectedTable, mainPageData);
      reLoad();
    } catch (err) {
      //console.log(err);
      notySvc.showError(characterLimitMsg);
    }
  }
}

export function tableSelectedCheck(value) {
  if (value.technicalDataProvider.selectedObjects.length <= 0) {
    message.show(
      1,
      lgepLocalizationUtils.getLocalizedText('lgepTechnicalMessages', 'editDocumentSel'),
      [lgepLocalizationUtils.getLocalizedText('lgepTechnicalMessages', 'close')],
      [function () {}],
    );
    return {
      tableSelectedState: false,
    };
  } else {
    return {
      tableSelectedState: true,
    };
  }
}

export function editInitialize() {
  const mainPageData = vms.getViewModelUsingElement(document.getElementById('mainTechnicalData'));
  const editPageData = vms.getViewModelUsingElement(document.getElementById('editTechnicalData'));

  $('#technicalEditSummernote').summernote({
    tabsize: 3,
    height: 500,
    toolbar: [
      ['fontsize', ['fontsize']],
      ['style', ['bold', 'italic', 'underline', 'strikethrough', 'clear']],
      ['color', ['forecolor', 'color']],
      ['table', ['table']],
      ['para', ['ul', 'ol', 'paragraph']],
      ['insert', ['picture', 'link']],
      ['codeview'],
    ],
    fontSizes: ['8', '9', '10', '11', '12', '14', '16', '18', '20', '22', '24', '28', '30', '36', '50', '72'],
  });
  let selectedTable = mainPageData.dataProviders.technicalDataProvider.selectedObjects[0];

  editPageData.technicalTitle.dbValue = selectedTable.props.object_name.dbValue;
  //써머노트에 값 삽입 전 기존에 있던 데이터 초기화
  $('#technicalEditSummernote').summernote('reset');
  //써머노트 내용 삽입
  $('#technicalEditSummernote').summernote('code', selectedTable.props.l2_content.dbValues[0] + '<br>');
  if (selectedTable.props.IMAN_specification != undefined) {
    editPageData.fileName = selectedTable.props.IMAN_specification.uiValues[0];
  }
}

export async function uploadFileToDataset(formData) {
  if (!formData) {
    return;
  } else {
    let file = formData.get('fmsFile');
    let result = await _createDatasets(file);
    _uploadFile(result, file);
    let dataset = await _commitDatasetFiles(result.modelObject, file, result.ticket);
    let con = dataset.uid;
    datasetUid = dataset.uid;
    return dataset;
  }
}

export async function createTechnicalDocument(data) {
  let contentString = $('#technicalCreateSummernote').summernote('code');
  if (contentString == null || contentString == '' || contentString == '<p><br></p>') {
    notySvc.showError('내용을 입력해주세요.');
    return;
  } else if (!data.technicalTitle.dbValues[0] || data.technicalTitle.dbValues[0] == '') {
    notySvc.showError('제목을 입력해주세요.');
    return;
  } else {
    // 중복 생성 방지
    let addBtn = document.querySelector('#addQuestion');
    addBtn.disabled = true;

    let createResult;
    try {
      let param = {
        properties: [
          {
            name: data.technicalTitle.dbValues[0],
            type: 'L2_TechDoc',
          },
        ],
      };
      createResult = await SoaService.post('Core-2006-03-DataManagement', 'createItems', param);
    } catch (err) {
      //console.log(err);
      notySvc.showError(characterLimitMsg);
      return;
      // notySvc.showError(characterLimitMsg);
    }

    try {
      // 아이템 리비전 정의
      let createItemRevision = createResult.output[0].itemRev;
      await com.getProperties([createItemRevision], ['item_id']);
      await lgepSummerNoteUtils.txtFileToDataset2(contentString, createItemRevision);
      //정규식을 사용하여 이미지를 제외한 문자열만 남긴다.
      contentString = await lgepSummerNoteUtils.imgAndsvgOnlyString(contentString);

      // 아이템 리비전 속성값 넣기
      let param = {
        objects: [createItemRevision],
        attributes: {
          l2_content_string: {
            stringVec: [contentString],
          },
        },
      };
      try {
        await SoaService.post('Core-2007-01-DataManagement', 'setProperties', param);
      } catch (err) {
        //console.log(err);
        notySvc.showError('질문 내용 등록 실패');
        delItem(createResult.output[0].item);
      }

      // IMAN_specification은 createRelation으로 값을 넣는다.
      var jsoObj = {
        input: [
          {
            clientId: '',
            relationType: 'IMAN_specification',
            primaryObject: createItemRevision,
            secondaryObject: com.getObject(datasetUid),
          },
        ],
      };
      try {
        let result = await SoaService.post('Core-2006-03-DataManagement', 'createRelations', jsoObj);
      } catch (err) {
        //console.log(err);
        notySvc.showError('relation 생성 실패');
        delItem(createResult.output[0].item);
      }
      await common.userLogsInsert('Create Document', createItemRevision.uid, 'S', 'Success');
      message.show(
        0,
        lgepLocalizationUtils.getLocalizedText('lgepTechnicalMessages', 'documentAddSuccess'),
        [lgepLocalizationUtils.getLocalizedText('lgepTechnicalMessages', 'close')],
        [function () {}],
      );
      datasetUid = null;

      eventBus.publish('technicalDocumentationTable.plTable.reload');
      eventBus.publish('awPopup.close');
      history.pushState(null, null, '#/technicalDocumentation?tech=' + createItemRevision.uid);
      // reLoad();
    } catch (err) {
      // 잘못 만들어진 아이템 삭제
      notySvc.showError('질문 생성 실패');
      delItem(createResult.output[0].item);
    }
  }
}

export function addInitialize() {
  $('#technicalCreateSummernote').summernote({
    tabsize: 3,
    height: 500,
    toolbar: [
      ['fontsize', ['fontsize']],
      ['style', ['bold', 'italic', 'underline', 'strikethrough', 'clear']],
      ['color', ['forecolor', 'color']],
      ['table', ['table']],
      ['para', ['ul', 'ol', 'paragraph']],
      ['insert', ['picture', 'link']],
      ['codeview'],
    ],
    fontSizes: ['8', '9', '10', '11', '12', '14', '16', '18', '20', '22', '24', '28', '30', '36', '50', '72'],
  });
}

export function deleteTechnical(value) {
  if (value == null || value == undefined) {
    message.show(
      1,
      lgepLocalizationUtils.getLocalizedText('lgepTechnicalMessages', 'deleteDocument'),
      [lgepLocalizationUtils.getLocalizedText('lgepTechnicalMessages', 'close')],
      [function () {}],
    );
    return;
  }

  message.show(
    1,
    '[ ' + value.props.object_name.dbValue + ' ]' + lgepLocalizationUtils.getLocalizedText('lgepTechnicalMessages', 'realDelete'),
    [lgepLocalizationUtils.getLocalizedText('lgepTechnicalMessages', 'delete'), lgepLocalizationUtils.getLocalizedText('lgepTechnicalMessages', 'cancel')],
    [
      async function () {
        let count = await query.executeSavedQuery('ReplySearch', ['L2_item_id', 'L2_object_type'], [value.cellHeader2, 'L2_LikeRevision']);

        let param = {
          objects: count,
          attributes: ['owning_user', 'l2_reference_post'],
        };
        try {
          await SoaService.post('Core-2006-03-DataManagement', 'getProperties', param);
        } catch (err) {
          //console.log(err);
        }

        let delItem = [];
        if (count != null) {
          for (let reply of count) {
            delItem.push(com.getObject(reply.props.items_tag.dbValues[0]));
          }
        }

        let deleteItem = {
          objects: delItem,
        };

        await SoaService.post('Core-2006-03-DataManagement', 'deleteObjects', deleteItem);

        let item;
        try {
          let getPropertiesParam = {
            infos: [
              {
                itemId: value.cellHeader2,
              },
            ],
          };
          item = await SoaService.post('Core-2007-01-DataManagement', 'getItemFromId', getPropertiesParam);
          item = item.output[0].item;
        } catch (err) {
          //console.log(err);
        }
        try {
          let deleteObj = {
            objects: [item],
          };
          await common.userLogsInsert('Delete Document', item.uid, 'S', 'Success');
          await SoaService.post('Core-2006-03-DataManagement', 'deleteObjects', deleteObj);
          reLoad();
          message.show(
            0,
            lgepLocalizationUtils.getLocalizedText('lgepTechnicalMessages', 'deleteSuccess'),
            [lgepLocalizationUtils.getLocalizedText('lgepTechnicalMessages', 'close')],
            [function () {}],
          );
          history.pushState(null, null, '#/technicalDocumentation');
          const data = vms.getViewModelUsingElement(document.getElementById('mainTechnicalData'));
          data.wriId.uiValue = '';
          data.wriTitle.uiValue = '';
          data.writer.uiValue = '';
          data.wriCreationDate.uiValue = '';
          data.wriViews.uiValue = '';
          data.wriLike.uiValue = '';
          $('#technicalSummernote').summernote('reset');
          value.props.IMAN_specification.type = '';
          data.wriDataSet.uiValue = '';
          data.wriDataSet.dbValue = '';
          data.wriDataSet.renderingHint = '';
          data.wriDataSet.intermediateObjectUids = '';
          data.wriDataSet.displayValues = '';
          data.dataProviders.technicalDataProvider.selectedObjects = [];
        } catch (err) {
          //console.log(err);
        }
      },
      function () {},
    ],
  );
}

export async function inLabel(value, data) {
  await com.getProperties([value], ['object_name', 'l2_like_count']);
  let viewCountTemp = value.props.l2_views.dbValues[0];
  viewCountTemp = parseInt(viewCountTemp);
  viewCountTemp++;
  viewCountTemp = String(viewCountTemp);
  let param = {
    objects: [value],
    attributes: {
      l2_views: {
        stringVec: [viewCountTemp],
      },
    },
  };
  try {
    await SoaService.post('Core-2007-01-DataManagement', 'setProperties', param);
    value.props.l2_content.dbValues[0] = await lgepSummerNoteUtils.readHtmlToSummernote(value);
  } catch (err) {
    //console.log(err);
  }

  // com.getProperties([item],["l2_view_count"]);
  data.wriId.uiValue = value.cellHeader2;
  data.wriTitle.uiValue = value.props.object_name.uiValue;
  data.writer.uiValue = value.props.owning_user.uiValue;
  data.wriCreationDate.uiValue = value.props.creation_date.uiValue;
  data.wriViews.uiValue = viewCountTemp;
  let count = await query.executeSavedQuery('ReplySearch', ['L2_item_id', 'L2_object_type'], [value.props.item_id.uiValues[0], 'L2_LikeRevision']);
  count = count != null ? count.length : 0;
  data.wriLike.uiValue = String(count);
  //써머노트에 값 삽입 전 기존에 있던 데이터 초기화
  $('#technicalSummernote').summernote('reset');
  //써머노트 내용 삽입
  $('#technicalSummernote').summernote('code', value.props.l2_content.dbValues[0] + '<br>');
  let dataset = com.getObjects(value.props.IMAN_specification.dbValues);
  //console.log({dataset});
  for (let i in dataset) {
    if (dataset[i].type == 'Text') {
      value.props.IMAN_specification.dbValues.splice(i, 1);
      value.props.IMAN_specification.uiValues.splice(i, 1);
    }
  }
  data.datasetLink.uiValues = value.props.IMAN_specification.uiValues;
  data.datasetLink.propertyDisplayName = value.props.IMAN_specification.uiValues[0];
  data.datasetLink.dbValues = value.props.IMAN_specification.dbValues;
  // reLoad();
  if (typeof history.pushState != 'undefined') {
    history.pushState(null, null, '#/technicalDocumentation?tech=' + value.uid);
  }
}

export function fileDelete(data) {
  data.fileName = '';
}

export function initialize() {
  $('#technicalSummernote').summernote({
    tabsize: 0,
    height: 450,
    width: '100%',
    styleWithSpan: true,
    toolbar: [],
  });
  $('#technicalSummernote').summernote('disable');
  $('#technicalSummernote').css('background-color', 'white');
}

export function reLoad() {
  eventBus.publish('technicalDocumentationTable.plTable.reload');
}

export async function getTechnicalTable(ctx) {
  lgepLoadingUtils.openWindow();

  let element = document.getElementsByClassName('leftPadding');
  let tableSize = localStorage.getItem('tableSize');
  element[0].style.flexBasis = tableSize != '' ? tableSize : '630px';

  initialize();
  // let searchingQuestion = await query.executeSavedQuery("PostSearch", ["L2_object_type"], ["L2_TechDocRevision"]);

  // let param = {
  //     objects: searchingQuestion,
  //     attributes: ["object_name", "creation_date", "owning_user", "l2_content", "item_id", "l2_views", "items_tag", "l2_point", "l2_content_string", "IMAN_specification", "l2_like_count", "owning_group"]
  // }
  // try {
  //     await SoaService.post("Core-2006-03-DataManagement", "getProperties", param);
  // } catch (err) {
  //     //console.log(err);
  // }

  // let questionList = [];

  // for (let item of searchingQuestion) {
  //     if (item.props.owning_group.uiValues[0] === ctx.userSession.props.group.uiValue) {
  //         questionList.push(item);
  //     }
  // }

  // questionList.sort((a, b) => new Date(b.props.creation_date.dbValues[0]) - new Date(a.props.creation_date.dbValues[0]));
  let searchingQuestion = [];
  try {
    let returnData = await searchQuestion(ctx.userSession.props.group_name.dbValue, showItem, ctx.searchString, (nowPage - 1) * showItem);
    searchingQuestion = returnData.modelObjects;
  } catch (err) {
    message.show(1, '질문 로드 중 오류가 발생했습니다.');
  }

  await common.userLogsInsert('Load Document', '', 'S', 'Success');

  lgepLoadingUtils.closeWindow();
  ctx.techList = searchingQuestion.length;

  return {
    result: searchingQuestion,
  };
}

export function applySortAndFilterRows(response, columnFilters, sortCriteria, startIndex, pageSize) {
  var countries = response.result;
  if (columnFilters) {
    // Apply filtering
    _.forEach(columnFilters, function (columnFilter) {
      countries = createFilters(columnFilter, countries);
    });
  }
  // Apply sort
  if (sortCriteria && sortCriteria.length > 0) {
    var criteria = sortCriteria[0];
    var sortDirection = criteria.sortDirection;
    var sortColName = criteria.fieldName;
    if (sortDirection === 'ASC') {
      countries.sort(function (a, b) {
        if (sortColName == 'l2_point') {
          if (parseInt(a.props[sortColName].uiValues[0]) > parseInt(b.props[sortColName].uiValues[0])) return 1;
          if (parseInt(a.props[sortColName].uiValues[0]) === parseInt(b.props[sortColName].uiValues[0])) return 0;
          if (parseInt(a.props[sortColName].uiValues[0]) < parseInt(b.props[sortColName].uiValues[0])) return -1;
        } else {
          if (a.props[sortColName].uiValues[0] > b.props[sortColName].uiValues[0]) return 1;
          if (a.props[sortColName].uiValues[0] === b.props[sortColName].uiValues[0]) return 0;
          if (a.props[sortColName].uiValues[0] < b.props[sortColName].uiValues[0]) return -1;
        }
      });
    } else if (sortDirection === 'DESC') {
      countries.sort(function (a, b) {
        if (sortColName == 'l2_point') {
          if (parseInt(a.props[sortColName].uiValues[0]) < parseInt(b.props[sortColName].uiValues[0])) return 1;
          if (parseInt(a.props[sortColName].uiValues[0]) === parseInt(b.props[sortColName].uiValues[0])) return 0;
          if (parseInt(a.props[sortColName].uiValues[0]) > parseInt(b.props[sortColName].uiValues[0])) return -1;
        } else {
          if (a.props[sortColName].uiValues[0] > b.props[sortColName].uiValues[0]) return 1;
          if (a.props[sortColName].uiValues[0] === b.props[sortColName].uiValues[0]) return 0;
          if (a.props[sortColName].uiValues[0] < b.props[sortColName].uiValues[0]) return -1;
        }
      });
    }
  }
  var endIndex = startIndex + pageSize;
  return countries.slice(startIndex, endIndex);
}

export function getFilterFacets(response, columnFilters, fullData) {
  var countries = response.result;
  var updateFilters = fullData.columnFilters;
  var columnName = fullData.column.name;
  var facetValues = {
    values: [],
    totalFound: 0,
  };
  // This mocks the server filtering data using existing column filters
  if (columnFilters) {
    // Apply filtering
    _.forEach(columnFilters, function (columnFilter) {
      if (columnName !== columnFilter.columnName) {
        countries = createFilters(columnFilter, countries);
      }
    });
  }
  if (updateFilters) {
    _.forEach(updateFilters, function (columnFilter) {
      countries = createFilters(columnFilter, countries);
    });
  }
  var facetsToReturn = [];
  _.forEach(countries, function (country) {
    if (country.props[columnName].uiValues[0]) {
      facetsToReturn.push(country.props[columnName].uiValues[0]);
    } else if (country.props[columnName].uiValues[0]) {
      _.forEach(country.props[columnName].uiValues[0], function (value) {
        facetsToReturn.push(value);
      });
    } else {
      facetsToReturn.push('');
    }
  });
  facetsToReturn = _.uniq(facetsToReturn);
  facetValues.totalFound = facetsToReturn.length;
  var startIndex = fullData.startIndex;
  var endIndex = startIndex + fullData.maxToReturn;
  facetsToReturn = facetsToReturn.slice(startIndex, endIndex + 1);
  facetValues.values = facetsToReturn;
  return facetValues;
}

export function getFilterFacetData(fullData) {
  return fullData;
}

function processCaseSensitiveNotEqualsFilter(columnFilter, countries) {
  return countries.filter(function (country) {
    for (var i = 0; i < columnFilter.values.length; i++) {
      if (!country.props[columnFilter.columnName].isArray) {
        if (columnFilter.values[i] === '' && (!country.props[columnFilter.columnName].value || country.props[columnFilter.columnName].value === null)) {
          return false;
        } else if (country.props[columnFilter.columnName].uiValues && columnFilter.values[i]) {
          return !country.props[columnFilter.columnName].uiValues[0].includes(columnFilter.values[i]);
        }
      } else {
        if (country.props[columnFilter.columnName].uiValues && columnFilter.values[i]) {
          let matchFound = false;
          _.forEach(country.props[columnFilter.columnName].uiValues, function (uiValue) {
            if (uiValue !== columnFilter.values[i]) {
              matchFound = true;
            }
          });
          return matchFound;
        }
      }
    }
    return true;
  });
}

function processContainsFilter(columnFilter, countries) {
  return countries.filter(function (country) {
    if (country.props[columnFilter.columnName].uiValue) {
      return country.props[columnFilter.columnName].uiValue.toLowerCase().includes(columnFilter.values[0].toLowerCase());
    } else if (country.props[columnFilter.columnName].uiValues) {
      return country.props[columnFilter.columnName].uiValues.toString().toLowerCase().includes(columnFilter.values[0].toLowerCase());
    }
  });
}

/**
 * This function mocks the server logic for filtering text data with the 'Does not contain' operation.
 *
 * @param {Object} columnFilter Filter to apply
 * @param {Array} countries The dataset to filter
 * @returns {Object} The country data that matches the filter
 */
function processNotContainsFilter(columnFilter, countries) {
  return countries.filter(function (country) {
    if (country.props[columnFilter.columnName].uiValue) {
      return !country.props[columnFilter.columnName].uiValue.toLowerCase().includes(columnFilter.values[0].toLowerCase());
    } else if (country.props[columnFilter.columnName].uiValues) {
      return !country.props[columnFilter.columnName].uiValues.toString().toLowerCase().includes(columnFilter.values[0].toLowerCase());
    }
  });
}

/**
 * This function mocks the server logic for filtering text data with the 'Begins with' operation.
 *
 * @param {Object} columnFilter Filter to apply
 * @param {Array} countries The dataset to filter
 * @returns {Object} The country data that matches the filter
 */
function processStartsWithFilter(columnFilter, countries) {
  return countries.filter(function (country) {
    if (country.props[columnFilter.columnName].uiValue) {
      return country.props[columnFilter.columnName].uiValue.toLowerCase().startsWith(columnFilter.values[0].toLowerCase());
    } else if (country.props[columnFilter.columnName].uiValues) {
      return country.props[columnFilter.columnName].uiValues[0].toLowerCase().startsWith(columnFilter.values[0].toLowerCase());
    }
  });
}

/**
 * This function mocks the server logic for filtering text data with the 'Ends with' operation.
 *
 * @param {Object} columnFilter Filter to apply
 * @param {Array} countries The dataset to filter
 * @returns {Object} The country data that matches the filter
 */
function processEndsWithFilter(columnFilter, countries) {
  return countries.filter(function (country) {
    if (country.props[columnFilter.columnName].uiValue) {
      return country.props[columnFilter.columnName].uiValue.toLowerCase().endsWith(columnFilter.values[0].toLowerCase());
    } else if (country.props[columnFilter.columnName].uiValues) {
      return country.props[columnFilter.columnName].uiValues[0].toLowerCase().endsWith(columnFilter.values[0].toLowerCase());
    }
  });
}

function processEqualsTextFilter(columnFilter, countries) {
  return countries.filter(function (country) {
    for (var i = 0; i < columnFilter.values.length; i++) {
      if (!country.props[columnFilter.columnName].isArray) {
        if (country.props[columnFilter.columnName].value && columnFilter.values[i]) {
          return country.props[columnFilter.columnName].value.toString().toLowerCase().includes(columnFilter.values[i].toLowerCase());
        } else if (columnFilter.values[i] === '' && (!country.props[columnFilter.columnName].value || country.props[columnFilter.columnName].value === null)) {
          return true;
        }
      } else {
        if (country.props[columnFilter.columnName].uiValues && columnFilter.values[i]) {
          return country.props[columnFilter.columnName].uiValues.toString().toLowerCase().includes(columnFilter.values[i].toLowerCase());
        }
      }
    }
    return false;
  });
}

/**
 * This function mocks the server logic for filtering text data with the 'Equals' operation.
 *
 * @param {Object} columnFilter Filter to apply
 * @param {Array} countries The dataset to filter
 * @returns {Object} The country data that matches the filter
 */
function processCaseSensitiveEqualsTextFilter(columnFilter, countries) {
  return countries.filter(function (country) {
    for (var i = 0; i < columnFilter.values.length; i++) {
      if (!country.props[columnFilter.columnName].isArray) {
        if (country.props[columnFilter.columnName].value && columnFilter.values[i]) {
          return country.props[columnFilter.columnName].value.toString().includes(columnFilter.values[i]);
        } else if (columnFilter.values[i] === '' && (!country.props[columnFilter.columnName].value || country.props[columnFilter.columnName].value === null)) {
          return true;
        }
      } else {
        if (country.props[columnFilter.columnName].uiValues && columnFilter.values[i]) {
          return country.props[columnFilter.columnName].uiValues.toString().includes(columnFilter.values[i]);
        }
      }
    }
    return false;
  });
}

function processNotEqualsTextFilter(columnFilter, countries) {
  return countries.filter(function (country) {
    for (var i = 0; i < columnFilter.values.length; i++) {
      if (!country.props[columnFilter.columnName].isArray) {
        if (columnFilter.values[i] === '' && (!country.props[columnFilter.columnName].value || country.props[columnFilter.columnName].value === null)) {
          return false;
        } else if (country.props[columnFilter.columnName].uiValue && columnFilter.values[i]) {
          return !country.props[columnFilter.columnName].uiValue.toLowerCase().includes(columnFilter.values[i].toLowerCase());
        }
      } else {
        if (country.props[columnFilter.columnName].uiValues && columnFilter.values[i]) {
          _.forEach(country.props[columnFilter.columnName].uiValues, function (uiValue) {
            //If one or more values in the array do not satisfy filter criteria, notEquals filter does not apply and the row is shown
            if (uiValue.toLowerCase() !== columnFilter.values[i].toLowerCase()) {
              return true;
            }
          });
          return false;
        }
      }
    }
    return true;
  });
}

function processTextFilters(columnFilter, countries) {
  switch (columnFilter.operation) {
    case 'contains':
      countries = processContainsFilter(columnFilter, countries);
      break;
    case 'notContains':
      countries = processNotContainsFilter(columnFilter, countries);
      break;
    case 'startsWith':
      countries = processStartsWithFilter(columnFilter, countries);
      break;
    case 'endsWith':
      countries = processEndsWithFilter(columnFilter, countries);
      break;
    case 'equals':
      countries = processEqualsTextFilter(columnFilter, countries);
      break;
    case 'caseSensitiveEquals':
      countries = processCaseSensitiveEqualsTextFilter(columnFilter, countries);
      break;
    case 'notEquals':
      countries = processNotEqualsTextFilter(columnFilter, countries);
      break;
    case 'caseSensitiveNotEquals':
      countries = processCaseSensitiveNotEqualsFilter(columnFilter, countries);
      break;
    default:
      break;
  }
  return countries;
}

function createFilters(columnFilter, countries) {
  countries = processTextFilters(columnFilter, countries);
  return countries;
}

/**
 *
 * @param {*} file
 */
function _createDatasets(file) {
  let childName = '';
  let type = '';
  if (file) {
    if (file.name.includes('.')) {
      type = file.name.split('.')[file.name.split('.').length - 1];
      childName = file.name.slice(0, -(type.length + 1));
      file.ext = type;
      file.onlyname = childName;
    }
  }
  var deferred = AwPromiseService.instance.defer();
  let selectedtype = [];
  if (type != null && type !== '') {
    type = type.toLowerCase();
    if (type === 'bmp') {
      selectedtype = ['Bitmap', 'Bitmap', 'Plain', 'Image'];
    } else if (type === 'jt') {
      selectedtype = ['DirectModel', 'DirectModel', 'Plain', 'JTPART'];
    } else if (type === 'cgm') {
      selectedtype = ['DrawingSheet', 'DrawingSheet', 'Plain', 'Sheet'];
    } else if (type === 'dwg') {
      selectedtype = ['DWG', 'DWG', 'Plain', 'DWG'];
    } else if (type === 'dxf') {
      selectedtype = ['DXF', 'DXF', 'Plain', 'DXF'];
    } else if (type === 'gif') {
      selectedtype = ['GIF', 'GIF', 'Plain', 'GIF_Reference'];
    } else if (type === 'jpg') {
      selectedtype = ['JPEG', 'JPEG', 'Plain', 'JPEG_Reference'];
    } else if (type === 'xls') {
      selectedtype = ['MSExcel', 'MSExcel', 'Plain', 'excel'];
    } else if (type === 'xlsx') {
      selectedtype = ['MSExcelX', 'MSExcels', 'Plain', 'excel'];
    } else if (type === 'ppt') {
      selectedtype = ['MSPowerPoint', 'MSPowerPoint', 'Plain', 'powerpoint'];
    } else if (type === 'pptx') {
      selectedtype = ['MSPowerPointX', 'MSPowerPointX', 'Plain', 'powerpoint'];
    } else if (type === 'doc') {
      selectedtype = ['MSWord', 'MSWord', 'Plain', 'word'];
    } else if (type === 'docx') {
      selectedtype = ['MSWordX', 'MSWordX', 'Plain', 'word'];
    } else if (type === 'mpp') {
      selectedtype = ['MSProject', 'MSProject', 'Plain', 'Ms_Project_Doc'];
    } else if (type === 'pdf') {
      selectedtype = ['PDF', 'PDF', 'Plain', 'PDF_Reference'];
    } else if (type === 'asm') {
      selectedtype = ['SE Assembly', 'SE Assembly', 'Plain', 'SE-assembly'];
    } else if (type === 'dft') {
      selectedtype = ['SE Draft', 'SE Draft', 'Plain', 'SE-draft'];
    } else if (type === 'par') {
      selectedtype = ['SE Part', 'SE Part', 'Plain', 'SE-part'];
    } else if (type === 'psm') {
      selectedtype = ['SE SheetMetal', 'SE SheetMetal', 'Plain', 'SE-sheetMetal'];
    } else if (type === 'pwd') {
      selectedtype = ['SE Weldment', 'SE Weldment', 'Plain', 'SE-weldment'];
    } else if (type === 'tif') {
      selectedtype = ['TIF', 'TIF', 'Plain', 'TIF_Reference'];
    } else if (type === 'txt') {
      selectedtype = ['Text', 'Text', 'Plain', 'Text'];
    } else if (type === 'zip') {
      selectedtype = ['Zip', 'Zip', 'Plain', 'ZIPFILE'];
    } else if (type === 'mht') {
      selectedtype = ['Text', 'Text', 'Plain', 'Text'];
    } else if (type === 'png') {
      selectedtype = ['Image', 'Image', 'Plain', 'Image'];
    }
  }
  let inputParam = {
    input: [
      {
        clientId: '0',
        name: file.name,
        type: selectedtype[0],
        datasetFileInfos: [
          {
            clientId: '1',
            fileName: file.name,
            namedReferenceName: selectedtype[3],
            isText: false,
            allowReplace: true,
          },
        ],
      },
    ],
  };
  SoaService.post('Core-2010-04-DataManagement', 'createDatasets', inputParam).then((res) => {
    //console.log(res);
    let result = {
      modelObject: res.datasetOutput[0].dataset,
      ticket: res.datasetOutput[0].commitInfo[0].datasetFileTicketInfos[0].ticket,
    };
    deferred.resolve(result);
  });
  return deferred.promise;
}
/**
 *
 * @param {*} result
 * @param {*} file
 */
function _uploadFile(result, file) {
  let ticketURL = result.ticket;
  var deferred = AwPromiseService.instance.defer();
  var request = new XMLHttpRequest();

  var formData = new FormData();
  formData.append('fmsFile', file, file.name);
  formData.append('fmsTicket', ticketURL);
  request.onload = function () {
    if (this.status >= 200 && this.status < 300) {
      deferred.resolve(request.response);
    } else {
      deferred.reject({
        status: request.status,
        statusText: request.statusText,
      });
    }
  };
  request.open('POST', document.location.origin + '/fms/fmsupload/', true);
  request.setRequestHeader('X-XSRF-TOKEN', _getCookieValue('XSRF-TOKEN'));
  request.send(formData);
}

/**
 *
 * @param {*} targetDataset
 * @param {*} file
 * @param {*} ticket
 */
function _commitDatasetFiles(targetDataset, file, ticket) {
  var deferred = AwPromiseService.instance.defer();
  let selectedtype = [];
  let type = file.ext;
  if (type != null && type !== '') {
    type = type.toLowerCase();
    if (type === 'bmp') {
      selectedtype = ['Bitmap', 'Bitmap', 'Plain', 'Image'];
    } else if (type === 'jt') {
      selectedtype = ['DirectModel', 'DirectModel', 'Plain', 'JTPART'];
    } else if (type === 'cgm') {
      selectedtype = ['DrawingSheet', 'DrawingSheet', 'Plain', 'Sheet'];
    } else if (type === 'dwg') {
      selectedtype = ['DWG', 'DWG', 'Plain', 'DWG'];
    } else if (type === 'dxf') {
      selectedtype = ['DXF', 'DXF', 'Plain', 'DXF'];
    } else if (type === 'gif') {
      selectedtype = ['GIF', 'GIF', 'Plain', 'GIF_Reference'];
    } else if (type === 'jpg') {
      selectedtype = ['JPEG', 'JPEG', 'Plain', 'JPEG_Reference'];
    } else if (type === 'xls') {
      selectedtype = ['MSExcel', 'MSExcel', 'Plain', 'excel'];
    } else if (type === 'xlsx') {
      selectedtype = ['MSExcelX', 'MSExcels', 'Plain', 'excel'];
    } else if (type === 'ppt') {
      selectedtype = ['MSPowerPoint', 'MSPowerPoint', 'Plain', 'powerpoint'];
    } else if (type === 'pptx') {
      selectedtype = ['MSPowerPointX', 'MSPowerPointX', 'Plain', 'powerpoint'];
    } else if (type === 'doc') {
      selectedtype = ['MSWord', 'MSWord', 'Plain', 'word'];
    } else if (type === 'docx') {
      selectedtype = ['MSWordX', 'MSWordX', 'Plain', 'word'];
    } else if (type === 'mpp') {
      selectedtype = ['MSProject', 'MSProject', 'Plain', 'Ms_Project_Doc'];
    } else if (type === 'pdf') {
      selectedtype = ['PDF', 'PDF', 'Plain', 'PDF_Reference'];
    } else if (type === 'asm') {
      selectedtype = ['SE Assembly', 'SE Assembly', 'Plain', 'SE-assembly'];
    } else if (type === 'dft') {
      selectedtype = ['SE Draft', 'SE Draft', 'Plain', 'SE-draft'];
    } else if (type === 'par') {
      selectedtype = ['SE Part', 'SE Part', 'Plain', 'SE-part'];
    } else if (type === 'psm') {
      selectedtype = ['SE SheetMetal', 'SE SheetMetal', 'Plain', 'SE-sheetMetal'];
    } else if (type === 'pwd') {
      selectedtype = ['SE Weldment', 'SE Weldment', 'Plain', 'SE-weldment'];
    } else if (type === 'tif') {
      selectedtype = ['TIF', 'TIF', 'Plain', 'TIF_Reference'];
    } else if (type === 'txt') {
      selectedtype = ['Text', 'Text', 'Plain', 'Text'];
    } else if (type === 'zip') {
      selectedtype = ['Zip', 'Zip', 'Plain', 'ZIPFILE'];
    } else if (type === 'mht') {
      selectedtype = ['Text', 'Text', 'Plain', 'Text'];
    } else if (type === 'png') {
      selectedtype = ['Image', 'Image', 'Plain', 'Image'];
    }
  }
  let inputParam = {
    commitInput: [
      {
        dataset: targetDataset,
        createNewVersion: true,
        datasetFileTicketInfos: [
          {
            datasetFileInfo: {
              clientId: '1',
              fileName: file.name,
              namedReferencedName: selectedtype[3],
              isText: false,
              allowReplace: true,
            },
            ticket: ticket,
          },
        ],
      },
    ],
  };
  if (type == 'txt' || type == 'mht') {
    inputParam.commitInput[0].datasetFileTicketInfos[0].datasetFileInfo.isText = true;
  }
  SoaService.post('Core-2006-03-FileManagement', 'commitDatasetFiles', inputParam).then((res) => {
    let keys = Object.keys(res.modelObjects);
    for (const key of keys) {
      if (com.instanceOf(res.modelObjects[key], 'Dataset')) {
        deferred.resolve(res.modelObjects[key]);
        return;
      }
    }
    deferred.resolve(null);
  });
  return deferred.promise;
}
/**
 *
 * @param {*} result
 * @param {*} file
 */

function _getCookieValue(key) {
  let cookieKey = key + '=';
  let result = '';
  const cookieArr = document.cookie.split(';');

  for (let i = 0; i < cookieArr.length; i++) {
    if (cookieArr[i][0] === ' ') {
      cookieArr[i] = cookieArr[i].substring(1);
    }

    if (cookieArr[i].indexOf(cookieKey) === 0) {
      result = cookieArr[i].slice(cookieKey.length, cookieArr[i].length);
      return result;
    }
  }
  return result;
}

async function setPageNumber(data, ctx) {
  let returnData = await searchQuestion(ctx.userSession.props.group_name.dbValue, 1, ctx.searchString, 0);
  let service = returnData.serviceData;
  lastPage = Math.ceil(service.totalFound / showItem);
  let frontPage = Math.floor((nowPage - 1) / dividePage) * dividePage + 1;
  let behindPage = frontPage - 1 + dividePage;
  if (behindPage > lastPage) {
    behindPage = lastPage;
  }
  let pageResponse = [];
  for (let i = frontPage; i <= behindPage; i++) {
    let select;
    if (i == nowPage) {
      select = true;
    } else {
      select = false;
    }
    pageResponse.push({
      chipType: 'SELECTION',
      labelDisplayName: String(i),
      selected: select,
    });
  }
  if (nowPage != 1) {
    data.beforePage.uiValue = '<';
    data.firstPage.uiValue = '≪';
  } else {
    data.beforePage.uiValue = '';
    data.firstPage.uiValue = '';
  }

  if (nowPage != lastPage) {
    data.afterPage.uiValue = '>';
    data.lastPage.uiValue = '≫';
  } else {
    data.afterPage.uiValue = '';
    data.lastPage.uiValue = '';
  }

  if (lastPage == 0) {
    data.beforePage.uiValue = '';
    data.firstPage.uiValue = '';
    data.afterPage.uiValue = '';
    data.lastPage.uiValue = '';
  }

  return {
    pageResponse: pageResponse,
    pageLength: pageResponse.length,
  };
}

function clickedPageAction(data, ctx, chip) {
  nowPage = Number(chip.labelDisplayName);
  eventBus.publish('pageChipDataProvider.reset');
  eventBus.publish('technicalDocumentationTable.plTable.reload');
}

function firstPageAction(data, ctx) {
  nowPage = firstPage;
  eventBus.publish('pageChipDataProvider.reset');
  eventBus.publish('technicalDocumentationTable.plTable.reload');
}

function pagingBeforeAction(data) {
  nowPage -= 1;
  eventBus.publish('pageChipDataProvider.reset');
  eventBus.publish('technicalDocumentationTable.plTable.reload');
}

function pagingAfterAction(data) {
  nowPage += 1;
  eventBus.publish('pageChipDataProvider.reset');
  eventBus.publish('technicalDocumentationTable.plTable.reload');
}

function lastPageAction(data) {
  nowPage = lastPage;
  eventBus.publish('pageChipDataProvider.reset');
  eventBus.publish('technicalDocumentationTable.plTable.reload');
}

/**
 *PerformSearch로 질문 목록 가져오기
 *
 * @param {string} group - 그룹명
 * @param {number} searchNum - 한번에 불러올 검색 갯수
 * @param {string} searchString - 검색값
 * @param {number} startIndex - 페이징 처리시 처음 불러올 부분
 */
async function searchQuestion(group, searchNum, searchString, startIndex) {
  if (searchString) {
    searchString = '*' + searchString + '*';
  } else {
    searchString = '*';
  }
  let param = {
    columnConfigInput: {
      clientName: 'AWClient',
      clientScopeURI: 'Awp0AdvancedSearch',
      operationType: 'Intersection',
      hostingClientName: '',
      columnsToExclude: [],
    },
    saveColumnConfigData: {
      columnConfigId: '',
      clientScopeURI: '',
      columns: [],
      scope: '',
      scopeName: '',
    },
    searchInput: {
      maxToLoad: searchNum,
      maxToReturn: searchNum,
      providerName: 'Awp0SavedQuerySearchProvider',
      searchCriteria: {
        Name: searchString,
        queryUID: 'Q0hJ_1nr5p7XAC',
        searchID: advancedSearchUtils.getSearchId('Q0hJ_1nr5p7XAC'),
        typeOfSearch: 'ADVANCED_SEARCH',
        utcOffset: '540',
        lastEndIndex: '',
        totalObjectsFoundReportedToClient: '',
        Type: 'L2_TechDocRevision',
        OwningGroup: group,
      },
      searchFilterFieldSortType: 'Priority',
      startIndex: startIndex,
      searchFilterMap6: {},
      searchSortCriteria: [
        {
          fieldName: 'creation_date',
          sortDirection: 'DESC',
        },
      ],
      attributesToInflate: [
        'object_name',
        'creation_date',
        'owning_user',
        'l2_content',
        'item_id',
        'l2_views',
        'items_tag',
        'l2_point',
        'l2_content_string',
        'IMAN_specification',
        'l2_like_count',
        'owning_group',
      ],
      internalPropertyName: '',
      columnFilters: [],
      cursor: {
        startIndex: 0,
        endIndex: 0,
        startReached: false,
        endReached: false,
      },
      focusObjUid: '',
      pagingType: '',
    },
    inflateProperties: true,
    noServiceData: false,
  };
  let abc = await SoaService.post('Internal-AWS2-2019-06-Finder', 'performSearchViewModel4', param);
  var modelObjects = [];
  var modelUid = abc.ServiceData.plain;
  if (modelUid && modelUid.length > 0) {
    for (let uid of modelUid) {
      var obj = abc.ServiceData.modelObjects[uid];
      modelObjects.push(obj);
    }
  }
  return {
    modelObjects: modelObjects,
    serviceData: abc,
  };
}

function questionSearch(data, ctx) {
  //console.log("검색값:",data.searchBox.dbValue);
  ctx.searchString = data.searchBox.dbValue;
  nowPage = 1;
  eventBus.publish('pageChipDataProvider.reset');
  eventBus.publish('technicalDocumentationTable.plTable.reload');
}

export async function delItem(item) {
  try {
    let deleteObj = {
      objects: [item],
    };
    await SoaService.post('Core-2006-03-DataManagement', 'deleteObjects', deleteObj);

    let addBtn = document.querySelector('#addQuestion');
    addBtn.disabled = false;
    return;
  } catch (err) {
    console.log('잘못된 아이템 삭제 실패');
  }
}

//기술 문서.js 끝

let exports = {};

export default exports = {
  initialize,
  getTechnicalTable,
  applySortAndFilterRows,
  getFilterFacets,
  getFilterFacetData,
  inLabel,
  deleteTechnical,
  reLoad,
  addInitialize,
  createTechnicalDocument,
  uploadFileToDataset,
  editInitialize,
  tableSelectedCheck,
  editTechnicalDocument,
  getUserTable,
  pointLabel,
  pointInitialize,
  userSelectedCheck,
  paymentPoint,
  expertLabel,
  userExpertSelectedCheck,
  expertInitialize,
  expertStateChange,
  likeUp,
  datasetLinkAction,
  fileDelete,
  setPageNumber,
  clickedPageAction,
  firstPageAction,
  pagingBeforeAction,
  pagingAfterAction,
  lastPageAction,
  questionSearch,
};

app.factory('technicalService', () => exports);
