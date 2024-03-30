import React, { useEffect, useState } from "react";
import { UserOutlined } from "@ant-design/icons";
import type { MenuProps, TableProps } from "antd";
import {
  Breadcrumb,
  Button,
  Col,
  Input,
  Layout,
  Menu,
  Modal,
  Row,
  Select,
  Space,
  Table,
  Tag,
  message,
  theme,
} from "antd";
import axios from "axios";

const { Header, Content, Sider } = Layout;
const { Option } = Select;

const items2: MenuProps["items"] = [UserOutlined].map((icon, index) => {
  const key = String(index + 1);

  return {
    key: `sub${key}`,
    icon: React.createElement(icon),
    label: `Dashboard`,

    children: new Array(1).fill(null).map((_, j) => {
      const subKey = index * 4 + j + 1;
      return {
        key: subKey,
        label: `Todo`,
      };
    }),
  };
});

interface DataType {
  _id: string;
  todoName: string;
  isComplete: boolean;
}

const Todo: React.FC = () => {
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const [data, setData] = useState<DataType[]>([]);
  const [isModalAdd, setIsModalAdd] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTodo, setSelectedTodo] = useState<DataType | null>(null);
  const [status, setStatus] = useState<boolean | null>(null);
  const [todoName, setTodoName] = useState<string>("");

  const showModal = (record: DataType) => {
    setSelectedTodo(record);
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setIsModalAdd(false);
  };

  const handleStatusChange = (value: boolean) => {
    setStatus(value);
  };

  const fetchData = async () => {
    const url = "https://calm-plum-jaguar-tutu.cyclic.app/todos";
    try {
      const response = await axios.get(url);
      setData(response.data.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const showModalAdd = () => {
    setIsModalAdd(true);
  };

  const handleAddData = () => {
    if (todoName && status !== null) {
      const url = "https://calm-plum-jaguar-tutu.cyclic.app/todos";
      const newData = { todoName, isComplete: status };

      axios
        .post(url, newData)
        .then((response) => {
          setData([...data, response.data]);
          setIsModalAdd(false);
          fetchData();
          message.success("Todo added successfully!");
        })
        .catch((error) => {
          console.error("Error adding data:", error);
        });
    }
  };

  const handleEdit = () => {
    if (selectedTodo && status !== null) {
      const url = `https://calm-plum-jaguar-tutu.cyclic.app/todos/${selectedTodo._id}`;
      const updatedTodo = { ...selectedTodo, isComplete: status };
      axios
        .put(url, updatedTodo)
        .then((response) => {
          console.log(response);
          const updatedData = data.map((item) => {
            if (item._id === selectedTodo._id) {
              return updatedTodo;
            }
            return item;
          });
          setData(updatedData);
          setIsModalOpen(false);
          message.success("Todo edited successfully!");
        })
        .catch((error) => {
          console.error("Error editing data:", error);
        });
    }
  };

  const handleDelete = (_id: string) => {
    Modal.confirm({
      title: "Confirm",
      content: "Are you sure you want to delete this item?",
      okText: "Yes",
      okType: "danger",
      cancelText: "No",
      onOk() {
        const url = `https://calm-plum-jaguar-tutu.cyclic.app/todos/${_id}`;
        axios
          .delete(url)
          .then((response) => {
            console.log(response);
            setData((prevData) => prevData.filter((item) => item._id !== _id));
            message.success("Todo deleted successfully!");
          })
          .catch((error) => {
            console.error("Error deleting data:", error);
          });
      },
    });
  };

  useEffect(() => {
    fetchData();
  }, []);

  const columns: TableProps<DataType>["columns"] = [
    {
      title: "Name",
      dataIndex: "todoName",
      key: "todoName",
      render: (text: string) => <a>{text}</a>,
    },
    {
      title: "Status",
      dataIndex: "isComplete",
      key: "isComplete",
      render: (isComplete: boolean) => (
        <Tag color={isComplete ? "green" : "red"}>
          {isComplete ? "Complete" : "Incomplete"}
        </Tag>
      ),
    },
    {
      title: "Action",
      key: "action",
      render: (_, record: DataType) => (
        <Space size="middle">
          <a style={{ color: "blue" }} onClick={() => showModal(record)}>
            Edit
          </a>
          <a style={{ color: "red" }} onClick={() => handleDelete(record._id)}>
            Delete
          </a>
        </Space>
      ),
    },
  ];

  return (
    <Layout>
      <Header style={{ display: "flex", alignItems: "center" }}>
        <div className="demo-logo" />
        <Menu theme="dark" mode="horizontal" style={{ flex: 1, minWidth: 0 }} />
      </Header>
      <Layout>
        <Sider width={200} style={{ background: colorBgContainer }}>
          <Menu
            mode="inline"
            defaultSelectedKeys={["1"]}
            defaultOpenKeys={["sub1"]}
            style={{ height: "100%", borderRight: 0 }}
            items={items2}
          />
        </Sider>
        <Layout style={{ padding: "0 24px 24px" }}>
          <Breadcrumb style={{ margin: "16px 0" }}>
            <Breadcrumb.Item>Home</Breadcrumb.Item>
            <Breadcrumb.Item>List</Breadcrumb.Item>
            <Breadcrumb.Item>Todo</Breadcrumb.Item>
          </Breadcrumb>
          <Content
            style={{
              padding: 24,
              margin: 0,
              minHeight: 280,
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
            }}
          >
            <Row justify="space-between" align="middle">
              <Col>
                <h1 style={{ fontWeight: "bold" }}>To Do List</h1>
              </Col>
              <Col>
                <Button
                  type="primary"
                  style={{ background: "#1890ff", borderColor: "#1890ff" }}
                  onClick={() => showModalAdd()}
                >
                  Add New
                </Button>
              </Col>
            </Row>
            <Table columns={columns} dataSource={data} />
          </Content>
        </Layout>
      </Layout>
      <Modal
        title="Edit"
        visible={isModalOpen}
        onOk={handleEdit}
        onCancel={handleCancel}
      >
        <p>Name: {selectedTodo?.todoName}</p>
        <Select
          style={{ width: "100%" }}
          placeholder="Select Status"
          onChange={(value: boolean) => handleStatusChange(value)}
          value={status}
        >
          <Option value={true}>Completed</Option>
          <Option value={false}>Incomplete</Option>
        </Select>
      </Modal>
      <Modal
        title="Add New"
        open={isModalAdd}
        onOk={handleAddData}
        onCancel={handleCancel}
      >
        <h2>Nama Todo</h2>
        <Input
          style={{ width: "100%", marginTop: "6px" }}
          placeholder="Enter Todo Name"
          value={todoName}
          onChange={(e) => setTodoName(e.target.value)}
        />
        <h2 className="mt-2">Status</h2>
        <Select
          style={{ width: "100%", marginTop: "6px" }}
          placeholder="Select Status"
          onChange={handleStatusChange}
          value={status}
        >
          <Option value={true}>Completed</Option>
          <Option value={false}>Incompleted</Option>
        </Select>
      </Modal>
      ;
    </Layout>
  );
};

export default Todo;
