import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Form, Input, Space, Button } from 'antd';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { coursesActions } from '../../../state/ducks/coursesDuck';
import { ModuleForm, ModuleCard } from '../module-form';

const StyledSpace = styled(Space)`
  &&& {
    width: 100%;
  }
`;

// CourseFormContainer — No specific parent, props isn't coming down quite yet
export default ({ isWrapped, onSubmit, courseId, courseToEdit }) => {
  let { id } = useParams();
  if (isWrapped) {
    id = courseId;
  }
  const { course, status } = useSelector(state => state.courses);
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const [moduleToEdit, setModuleToEdit] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    if (id) {
      dispatch(coursesActions.getCourseThunk(id));
    }
  }, [id, dispatch, isWrapped]);

  useEffect(() => {
    if (isWrapped) {
      form.setFieldsValue({ ...courseToEdit });
    } else if (status === 'success') {
      form.setFieldsValue({ ...course });
    }
  }, [status, course, form, isWrapped, courseToEdit]);

  const showModuleModal = () => setModalVisible(true);
  const hideModuleModal = () => setModalVisible(false);

  const onFinish = values => {
    if (isWrapped) {
      console.log('COURSE else if (isWrapped):', {
        ...form.getFieldsValue(),
        courseid: courseId,
      });
      onSubmit({ ...form.getFieldsValue(), courseid: courseId });
    } else if (id) {
      console.log('COURSE if (id):', { ...values, courseid: id });
      dispatch(coursesActions.editCourseThunk({ ...values, courseid: id }));
    } else {
      console.log('COURSE else:', values);
      dispatch(coursesActions.addCourseThunk(values));
    }
  };

  const onModuleAdd = newModule => {
    const existingModules = form.getFieldValue('modules') || [];
    form.setFieldsValue({
      modules: [...existingModules, newModule],
    });
    hideModuleModal();
  };

  const onModuleEdit = editedModule => {
    const existingModules = form.getFieldValue('modules') || [];

    form.setFieldsValue({
      modules: existingModules.map(existingModule => {
        if (existingModule.moduleId !== editedModule.moduleId) {
          return existingModule;
        } else {
          return editedModule;
        }
      }),
    });

    hideModuleModal();
  };

  const triggerEdit = module => {
    console.log({ module });
    setModuleToEdit(module);
    showModuleModal();
  };

  return (
    <StyledSpace direction="vertical" align="center">
      <h1>Course Form</h1>
      <Form
        form={form}
        name="courseForm"
        onFinish={onFinish}
        autoComplete="off"
        layout="vertical"
      >
        <Form.Item
          name="coursename"
          label="Course Name"
          rules={[{ required: true, message: 'Missing Course Name' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="coursecode"
          label="Course Code"
          rules={[{ required: true, message: 'Missing Course Code' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="coursedescription"
          label="Course Description"
          rules={[{ required: true, message: 'Missing Course Description' }]}
        >
          <Input.TextArea style={{ resize: 'none' }} rows={2} cols={2} />
        </Form.Item>

        <Form.Item name="modules" label="Module List">
          {// if `formState.modules` both exists & has a length greater than 0,
          form.getFieldValue('modules')?.length > 0 ? (
            // then map through each module in array and return a list of ModuleCards
            form.getFieldValue('modules').map((module, index) => (
              <li key={index} className="module">
                <ModuleCard
                  {...module}
                  module={module}
                  triggerEdit={triggerEdit}
                />
              </li>
            ))
          ) : (
            // else, we don't have any modules in this course!
            <p>No modules yet!</p>
          )}
        </Form.Item>

        <Form.Item>
          <Button htmlType="button" onClick={showModuleModal}>
            Add Module
          </Button>
        </Form.Item>

        <Form.Item>
          <Button htmlType="submit" type="primary">
            Submit
          </Button>
        </Form.Item>
      </Form>
      {moduleToEdit ? (
        <ModuleForm
          visible={modalVisible}
          onCancel={hideModuleModal}
          onSubmit={onModuleEdit}
          moduleToEdit={moduleToEdit}
          moduleId={moduleToEdit.moduleId}
          isWrapped={true}
        />
      ) : (
        <ModuleForm
          visible={modalVisible}
          onCancel={hideModuleModal}
          onSubmit={onModuleAdd}
          isWrapped={true}
        />
      )}
    </StyledSpace>
  );
};
