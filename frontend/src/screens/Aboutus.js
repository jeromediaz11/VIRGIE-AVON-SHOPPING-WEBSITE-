import React from "react";
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Image from 'react-bootstrap/Image';

const AboutScreen = () => {
  return (
    <Container className="pt-9 px-4">
      <Row className="justify-content-between gap-8">
        <Col lg={5}>
          <h1 className="text-3xl lg:text-4xl font-bold leading-9 text-pink-800 pb-4">About Us</h1>
          <p className="font-normal text-base leading-6 text-gray-600">
            Welcome to Avon Virgie, a website that brings you the best Avon products and services. We are four students passionate about beauty and helping others. We wanted to create a platform where everyone could feel confident and beautiful.
            We are excited to offer a wide range of Avon makeup products, including lipstick, pressed powder, brow liner, and more.
            Our website is named after Virgie, the mother of one of our team members. Virgie has always been a source of inspiration and support for her daughter, Pearl Nerijean G. Calape, and she is passionate about helping others feel their best. We are honored to dedicate this website to her.
            We are committed to providing our customers with the best possible shopping experience.
            We hope you will enjoy shopping at Avon Virgie. Thank you for supporting the website!
          </p>
        </Col>
        <Col lg={6}>
          <Image src="https://i.pinimg.com/736x/0e/d3/44/0ed344298c492d445319865592c4111b.jpg" alt="Avon story" className="img-fluid rounded shadow" />
        </Col>
      </Row>

      <Row className="justify-content-between gap-8 pt-12">
        <Col lg={5}>
          <h1 className="text-3xl lg:text-4xl font-bold leading-9 text-pink-800 pb-4">Our Story</h1>
          <p className="font-normal text-base leading-6 text-gray-600">
            Avon Virgie is still a young website, but it will grow to become a trusted resource for Avon customers. The team is committed to providing their customers with the best possible browsing experience, and they are always looking for new ways to improve the website.
            In the future, the team hopes to expand Avon Virgie to offer even more products and services and to reach even more Avon customers. They also hope to continue to support the local community through their charitable giving initiatives.
            Thank you for choosing Avon Virgie
          </p>
        </Col>
        <Col lg={7}>
          <Row className="justify-content-between" style={{ marginTop: '60px', marginLeft: "92px" }}>
            <Col lg={3}>
              <Image src="https://i.ibb.co/JkjTh9N/6b8c0c391cf5070e1e57db65ffc19e51.jpg" alt="Violy Joy G. Julapong" className="img-fluid rounded shadow" />
              <p className="text-center">Violy Joy G. Julapong</p>
            </Col>
            <Col lg={3}>
              <Image src="https://i.pinimg.com/736x/99/5b/fa/995bfa388ff45bbdc099acadf0bb5c69.jpg" alt="Pearl Nerijean Calape" className="img-fluid rounded shadow" />
              <p className="text-center">Pearl Nerijean Calape</p>
            </Col>
            <Col lg={3}>
              <Image src="https://i.pinimg.com/736x/14/43/ec/1443ec1d851b529627c0f3f9e8ac3738.jpg" alt="Jerome Diaz" className="img-fluid rounded shadow" />
              <p className="text-center">Jerome Diaz</p>
            </Col>
            <Col lg={3}>
              <Image src="https://i.pinimg.com/736x/44/5e/c1/445ec16ee41a3193eae33e11ef832e5d.jpg" alt="Jethro Parker" className="img-fluid rounded shadow" />
              <p className="text-center">Jethro Parker</p>
            </Col>
          </Row>
        </Col>
      </Row>

     
    </Container>
  );
};

export default AboutScreen;
